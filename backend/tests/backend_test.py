"""CircuitWorks backend API tests: auth (login/me/refresh/logout, brute force), bookings CRUD."""
import os
import re
import uuid
from pathlib import Path

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def test_credentials():
    p = Path("/app/memory/test_credentials.md")
    if not p.exists():
        pytest.skip("missing test_credentials.md")
    c = p.read_text(encoding="utf-8")
    e = re.search(r'(?im)^\s*(?:[-*]\s*)?(?:\*\*)?email(?:\*\*)?\s*:\s*`?([^`\s]+)', c)
    pw = re.search(r'(?im)^\s*(?:[-*]\s*)?(?:\*\*)?password(?:\*\*)?\s*:\s*`?([^`\s]+)', c)
    if not e or not pw:
        pytest.skip("no creds parsed")
    return {"email": e.group(1), "password": pw.group(1)}


@pytest.fixture(scope="session")
def anon():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def auth_client(test_credentials):
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    r = s.post(f"{API}/auth/login", json=test_credentials)
    if r.status_code != 200:
        pytest.fail(f"login failed {r.status_code}: {r.text[:300]}")
    return s


# ---------- Health ----------
class TestHealth:
    def test_root(self, anon):
        r = anon.get(f"{API}/")
        assert r.status_code == 200
        assert "message" in r.json()


# ---------- Auth ----------
class TestAuth:
    def test_login_success_sets_cookies(self, test_credentials):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json=test_credentials)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == test_credentials["email"].lower()
        assert data["role"] == "admin"
        assert isinstance(data["id"], str) and len(data["id"]) == 24
        assert "password_hash" not in data
        assert "access_token" in s.cookies and "refresh_token" in s.cookies
        raw = "\n".join(v for k, v in r.headers.items() if k.lower() == "set-cookie")
        assert "HttpOnly" in r.headers.get("set-cookie", "") or "HttpOnly" in raw

    def test_login_invalid_password(self, test_credentials):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": test_credentials["email"], "password": "wrong-pass-xyz"})
        assert r.status_code == 401
        assert "detail" in r.json()
        # do NOT leave failed attempts on the real admin
        s.post(f"{API}/auth/login", json=test_credentials)

    def test_login_validation_error(self, anon):
        r = anon.post(f"{API}/auth/login", json={"email": "a", "password": ""})
        assert r.status_code == 422

    def test_me_requires_auth(self, anon):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_authenticated(self, auth_client, test_credentials):
        r = auth_client.get(f"{API}/auth/me")
        assert r.status_code == 200
        assert r.json()["email"] == test_credentials["email"].lower()

    def test_refresh_rotates_access_token(self, test_credentials):
        s = requests.Session()
        s.post(f"{API}/auth/login", json=test_credentials)
        r = s.post(f"{API}/auth/refresh")
        assert r.status_code == 200
        assert s.get(f"{API}/auth/me").status_code == 200

    def test_refresh_without_cookie(self):
        r = requests.post(f"{API}/auth/refresh")
        assert r.status_code == 401

    def test_refresh_token_not_valid_as_access(self, test_credentials):
        s = requests.Session()
        s.post(f"{API}/auth/login", json=test_credentials)
        refresh = s.cookies.get("refresh_token")
        r = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {refresh}"})
        assert r.status_code == 401

    def test_invalid_bearer_token(self):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer not.a.jwt"})
        assert r.status_code == 401

    def test_logout_clears_session(self, test_credentials):
        s = requests.Session()
        s.post(f"{API}/auth/login", json=test_credentials)
        assert s.get(f"{API}/auth/me").status_code == 200
        r = s.post(f"{API}/auth/logout")
        assert r.status_code == 200
        assert s.get(f"{API}/auth/me").status_code == 401


# ---------- Brute force ----------
class TestBruteForce:
    def test_lockout_after_five_failures(self):
        throwaway = f"fake+{uuid.uuid4().hex[:8]}@x.com"
        codes = []
        for _ in range(5):
            r = requests.post(f"{API}/auth/login", json={"email": throwaway, "password": "nope"})
            codes.append(r.status_code)
        assert codes == [401] * 5, codes
        r6 = requests.post(f"{API}/auth/login", json={"email": throwaway, "password": "nope"})
        assert r6.status_code == 429, f"expected 429 got {r6.status_code}: {r6.text[:200]}"
        assert "Too many" in r6.json().get("detail", "")


# ---------- Bookings ----------
class TestBookings:
    created = []

    def _payload(self):
        return {
            "name": "TEST_QA Tester",
            "email": "qa-test@example.test",
            "phone": "555-0100",
            "device_type": "Laptop",
            "service": "Diagnostics",
            "preferred_date": "2026-07-15",
            "message": "TEST_ automated regression booking",
        }

    def test_bookings_list_requires_auth(self):
        r = requests.get(f"{API}/bookings")
        assert r.status_code == 401

    def test_patch_requires_auth(self):
        r = requests.patch(f"{API}/bookings/6a90fa55ca74e3de13a98e63", json={"status": "handled"})
        assert r.status_code == 401

    def test_create_booking_public_and_persist(self, anon, auth_client):
        payload = self._payload()
        r = anon.post(f"{API}/bookings", json=payload)
        assert r.status_code == 201, r.text
        b = r.json()
        assert "_id" not in b and "id" in b
        assert b["status"] == "new"
        for k in ("name", "email", "device_type", "service", "message"):
            assert b[k] == payload[k]
        TestBookings.created.append(b["id"])

        lst = auth_client.get(f"{API}/bookings")
        assert lst.status_code == 200
        items = lst.json()
        assert all("_id" not in i for i in items)
        found = [i for i in items if i["id"] == b["id"]]
        assert found, "created booking not returned by GET /api/bookings"
        assert found[0]["name"] == payload["name"]

    def test_create_booking_validation(self, anon):
        r = anon.post(f"{API}/bookings", json={"name": "", "email": "x"})
        assert r.status_code == 422

    def test_status_transitions_persist(self, anon, auth_client):
        bid = anon.post(f"{API}/bookings", json=self._payload()).json()["id"]
        TestBookings.created.append(bid)

        r = auth_client.patch(f"{API}/bookings/{bid}", json={"status": "handled"})
        assert r.status_code == 200
        assert r.json()["status"] == "handled"
        got = [i for i in auth_client.get(f"{API}/bookings").json() if i["id"] == bid][0]
        assert got["status"] == "handled"

        r = auth_client.patch(f"{API}/bookings/{bid}", json={"status": "new"})
        assert r.status_code == 200 and r.json()["status"] == "new"
        got = [i for i in auth_client.get(f"{API}/bookings").json() if i["id"] == bid][0]
        assert got["status"] == "new"

    def test_patch_invalid_status(self, anon, auth_client):
        bid = anon.post(f"{API}/bookings", json=self._payload()).json()["id"]
        TestBookings.created.append(bid)
        r = auth_client.patch(f"{API}/bookings/{bid}", json={"status": "bogus"})
        assert r.status_code == 422

    def test_patch_malformed_id(self, auth_client):
        r = auth_client.patch(f"{API}/bookings/not-an-oid", json={"status": "handled"})
        assert r.status_code == 400

    def test_patch_missing_booking(self, auth_client):
        r = auth_client.patch(f"{API}/bookings/6a90fa55ca74e3de13a98e00", json={"status": "handled"})
        assert r.status_code == 404
