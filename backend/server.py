from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, BackgroundTasks, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import bcrypt
import jwt
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from typing import List, Optional, Annotated
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from datetime import datetime, timezone, timedelta, time
from zoneinfo import ZoneInfo

from email_service import send_new_booking_alert, send_status_email

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

PyObjectId = Annotated[str, BeforeValidator(str)]

JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ["JWT_SECRET"]

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ---------- Auth helpers ----------

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "type": "access",
               "exp": datetime.now(timezone.utc) + timedelta(minutes=15)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "type": "refresh",
               "exp": datetime.now(timezone.utc) + timedelta(days=7)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie("access_token", access_token, httponly=True, secure=True,
                        samesite="none", max_age=900, path="/")
    response.set_cookie("refresh_token", refresh_token, httponly=True, secure=True,
                        samesite="none", max_age=604800, path="/")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


LOCKOUT_MINUTES = 15
MAX_ATTEMPTS = 5


def client_ip(request: Request) -> str:
    xff = request.headers.get("X-Forwarded-For", "")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def check_brute_force(identifier: str):
    doc = await db.login_attempts.find_one({"identifier": identifier})
    if doc and doc.get("count", 0) >= MAX_ATTEMPTS:
        last = doc["last_failed_at"]
        if last.tzinfo is None:
            last = last.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) - last < timedelta(minutes=LOCKOUT_MINUTES):
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")
        await db.login_attempts.delete_one({"identifier": identifier})


async def record_failed_attempt(identifier: str):
    await db.login_attempts.update_one(
        {"identifier": identifier},
        {"$inc": {"count": 1}, "$set": {"last_failed_at": datetime.now(timezone.utc)}},
        upsert=True,
    )


BOOKING_RATE_LIMIT = 5
BOOKING_RATE_WINDOW_MINUTES = 15


async def check_booking_rate(request: Request):
    ip = client_ip(request)
    window_start = datetime.now(timezone.utc) - timedelta(minutes=BOOKING_RATE_WINDOW_MINUTES)
    count = await db.booking_rate.count_documents({"ip": ip, "at": {"$gte": window_start}})
    if count >= BOOKING_RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later or call us directly.")
    await db.booking_rate.insert_one({"ip": ip, "at": datetime.now(timezone.utc)})


# ---------- Models ----------

class LoginInput(BaseModel):
    email: str = Field(min_length=3, max_length=200)
    password: str = Field(min_length=1, max_length=200)


class UserOut(BaseModel):
    id: str
    email: str
    name: str = ""
    role: str = "admin"


class BookingCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=200)
    phone: str = Field(default="", max_length=40)
    device_type: str = Field(min_length=1, max_length=80)
    service: str = Field(min_length=1, max_length=120)
    preferred_date: Optional[str] = None
    time_slot: Optional[str] = None
    message: str = Field(default="", max_length=2000)


class BookingStatusUpdate(BaseModel):
    status: str = Field(pattern="^(new|accepted|handled)$")


class BlockedDayInput(BaseModel):
    date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")


class Booking(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: PyObjectId = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    name: str
    email: str
    phone: str = ""
    device_type: str
    service: str
    preferred_date: Optional[str] = None
    time_slot: Optional[str] = None
    message: str = ""
    status: str = "new"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def to_mongo(self) -> dict:
        doc = self.model_dump(by_alias=True)
        doc["_id"] = ObjectId(doc["_id"])
        doc["created_at"] = doc["created_at"].isoformat()
        return doc

    @classmethod
    def from_mongo(cls, doc: dict) -> "Booking":
        if isinstance(doc.get("created_at"), str):
            doc["created_at"] = datetime.fromisoformat(doc["created_at"])
        return cls(**doc)


# ---------- Auth routes ----------

@api_router.post("/auth/login", response_model=UserOut)
async def login(input: LoginInput, request: Request, response: Response):
    email = input.email.strip().lower()
    identifier = f"{client_ip(request)}:{email}"
    await check_brute_force(identifier)
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(input.password, user["password_hash"]):
        await record_failed_attempt(identifier)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await db.login_attempts.delete_one({"identifier": identifier})
    user_id = str(user["_id"])
    set_auth_cookies(response, create_access_token(user_id, email), create_refresh_token(user_id))
    return UserOut(id=user_id, email=email, name=user.get("name", ""), role=user.get("role", "admin"))


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/", secure=True, samesite="none")
    response.delete_cookie("refresh_token", path="/", secure=True, samesite="none")
    return {"message": "Logged out"}


@api_router.get("/auth/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return UserOut(id=user["_id"], email=user["email"], name=user.get("name", ""), role=user.get("role", "admin"))


@api_router.post("/auth/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access = create_access_token(str(user["_id"]), user["email"])
        response.set_cookie("access_token", access, httponly=True, secure=True,
                            samesite="none", max_age=900, path="/")
        return {"message": "Token refreshed"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------- Scheduling ----------

TIME_SLOTS = ["10:00", "12:00", "14:00"]
BUSINESS_TZ = ZoneInfo("America/Moncton")


def slot_label(slot: str) -> str:
    return f"{slot}–{int(slot[:2]) + 2}:00"


async def compute_availability(date_str: str) -> dict:
    try:
        day = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, expected YYYY-MM-DD")
    blocked = await db.blocked_days.find_one({"date": date_str}) is not None
    now_local = datetime.now(BUSINESS_TZ)
    past = day < now_local.date()
    taken = set()
    async for doc in db.bookings.find(
        {"preferred_date": date_str, "time_slot": {"$in": TIME_SLOTS}, "status": {"$in": ["new", "accepted"]}}
    ):
        taken.add(doc["time_slot"])
    slots = []
    for i, s in enumerate(TIME_SLOTS):
        buffered = i > 0 and TIME_SLOTS[i - 1] in taken
        slot_passed = day == now_local.date() and now_local.time() >= time(int(s[:2]), 0)
        available = not (blocked or past or slot_passed or s in taken or buffered)
        slots.append({"slot": s, "label": slot_label(s), "available": available})
    return {"date": date_str, "blocked": blocked, "slots": slots}


@api_router.get("/availability")
async def availability(date: str):
    return await compute_availability(date)


@api_router.get("/blocked-days")
async def list_blocked_days(user: dict = Depends(get_current_user)):
    docs = await db.blocked_days.find().sort("date", 1).to_list(730)
    return [{"date": d["date"]} for d in docs]


@api_router.post("/blocked-days", status_code=201)
async def add_blocked_day(input: BlockedDayInput, user: dict = Depends(get_current_user)):
    await db.blocked_days.update_one({"date": input.date}, {"$set": {"date": input.date}}, upsert=True)
    return {"date": input.date}


@api_router.delete("/blocked-days/{date}")
async def remove_blocked_day(date: str, user: dict = Depends(get_current_user)):
    await db.blocked_days.delete_one({"date": date})
    return {"message": "unblocked"}


# ---------- Booking routes ----------

@api_router.get("/")
async def root():
    return {"message": "CircuitWorks API"}


@api_router.post("/bookings", response_model=Booking, response_model_by_alias=False, status_code=201)
async def create_booking(input: BookingCreate, request: Request, background_tasks: BackgroundTasks):
    await check_booking_rate(request)
    if input.time_slot:
        if input.time_slot not in TIME_SLOTS:
            raise HTTPException(status_code=400, detail="Invalid time slot")
        if not input.preferred_date:
            raise HTTPException(status_code=400, detail="A date is required when picking a time slot")
        avail = await compute_availability(input.preferred_date)
        if not any(s["slot"] == input.time_slot and s["available"] for s in avail["slots"]):
            raise HTTPException(status_code=409, detail="That time slot is no longer available — please pick another.")
    booking = Booking(**input.model_dump())
    try:
        await db.bookings.insert_one(booking.to_mongo())
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="That time slot is no longer available — please pick another.")
    background_tasks.add_task(send_new_booking_alert, input.model_dump())
    return booking


@api_router.get("/bookings", response_model=List[Booking], response_model_by_alias=False)
async def list_bookings(user: dict = Depends(get_current_user)):
    docs = await db.bookings.find().sort("created_at", -1).to_list(500)
    return [Booking.from_mongo(doc) for doc in docs]


@api_router.patch("/bookings/{booking_id}")
async def update_booking_status(booking_id: str, input: BookingStatusUpdate,
                                user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking id")
    existing = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Booking not found")
    email_sent = None
    if existing["status"] != input.status:
        try:
            await db.bookings.update_one({"_id": ObjectId(booking_id)}, {"$set": {"status": input.status}})
        except DuplicateKeyError:
            raise HTTPException(status_code=409,
                                detail="Cannot reopen — that time slot has since been booked by another request.")
        existing["status"] = input.status
        if input.status in ("accepted", "handled"):
            payload = {k: v for k, v in existing.items() if k != "_id"}
            email_sent = await send_status_email(payload, input.status)
    result = Booking.from_mongo(existing).model_dump()
    result["email_sent"] = email_sent
    return result


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.login_attempts.create_index("last_failed_at", expireAfterSeconds=3600)
    await db.booking_rate.create_index("at", expireAfterSeconds=3600)
    await db.bookings.create_index(
        [("preferred_date", 1), ("time_slot", 1)],
        unique=True,
        partialFilterExpression={"time_slot": {"$in": TIME_SLOTS}, "status": {"$in": ["new", "accepted"]}},
        name="unique_active_slot",
    )
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Owner",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Admin user seeded")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email},
                                  {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Admin password updated from env")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
