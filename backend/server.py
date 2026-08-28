from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from typing import List, Optional, Annotated
from bson import ObjectId
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

PyObjectId = Annotated[str, BeforeValidator(str)]


class BookingCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=200)
    phone: str = Field(default="", max_length=40)
    device_type: str = Field(min_length=1, max_length=80)
    service: str = Field(min_length=1, max_length=120)
    preferred_date: Optional[str] = None
    message: str = Field(default="", max_length=2000)


class Booking(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: PyObjectId = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    name: str
    email: str
    phone: str = ""
    device_type: str
    service: str
    preferred_date: Optional[str] = None
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


@api_router.get("/")
async def root():
    return {"message": "CircuitWorks API"}


@api_router.post("/bookings", response_model=Booking, response_model_by_alias=False, status_code=201)
async def create_booking(input: BookingCreate):
    booking = Booking(**input.model_dump())
    await db.bookings.insert_one(booking.to_mongo())
    return booking


@api_router.get("/bookings", response_model=List[Booking], response_model_by_alias=False)
async def list_bookings():
    docs = await db.bookings.find().sort("created_at", -1).to_list(500)
    return [Booking.from_mongo(doc) for doc in docs]


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
