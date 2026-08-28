# Auth Testing Playbook (CircuitWorks)

Step 1: MongoDB Verification
```
mongosh
use test_database
db.users.find({role: "admin"}).pretty()
db.users.findOne({role: "admin"}, {password_hash: 1})
```
Verify: bcrypt hash starts with `$2b$`, indexes exist on users.email (unique), login_attempts.identifier.

Step 2: API Testing
```
curl -c cookies.txt -X POST http://localhost:8001/api/auth/login -H "Content-Type: application/json" -d '{"email":"owner@circuitworks.tech","password":"CircuitAdmin!2026"}'
cat cookies.txt
curl -b cookies.txt http://localhost:8001/api/auth/me
curl -b cookies.txt http://localhost:8001/api/bookings
```
Login should return the user object and set `access_token` + `refresh_token` cookies.
GET /api/bookings without cookies must return 401.
PATCH /api/bookings/{id} with {"status":"handled"} must update and return the booking.

Step 3: Brute force
5 wrong-password logins for the same email → 6th attempt returns 429.
