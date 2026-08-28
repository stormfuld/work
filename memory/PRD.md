# CircuitWorks — PRD

## Original Problem Statement
"Build a landing page: I want to create a full website for my computer technician side business. I want it sleek and professional."

## User Choices
- (2026-08-28) Landing page + booking/quote request form saved for review; dark, sleek, techy; placeholders for business details
- (2026-06 fork) Owner Dashboard (private login, filter, mark handled) + Email alerts on new quote + real business details (details still pending from user)

## Architecture
- Frontend: React 19 + Tailwind, framer-motion, lenis, react-fast-marquee, sonner, axios, react-router-dom (routes: `/` landing, `/admin` owner area)
- Backend: FastAPI, Motor (async MongoDB), bcrypt + PyJWT httpOnly-cookie auth, Emergent managed email proxy (httpx)
- DB: MongoDB via MONGO_URL / DB_NAME
- Design: "Tech Noir" — #050505 obsidian, #00F0FF neon cyan, Cabinet Grotesk / JetBrains Mono

## Implemented
### 2026-08-28 (MVP)
- Landing page: nav, kinetic hero, marquee, manifesto, services bento, pricing, about, booking form, footer
- POST /api/bookings (public) + GET /api/bookings

### 2026-06 fork (Owner Dashboard + Email Alerts)
- JWT auth (integration playbook): POST /api/auth/login|logout|refresh, GET /api/auth/me; httpOnly secure cookies (access 15m / refresh 7d); admin seeded from backend/.env (owner@circuitworks.tech / CircuitAdmin!2026 — see memory/test_credentials.md)
- Brute force lockout: 5 fails per ip:email → 15 min 429; keyed on X-Forwarded-For first hop (ingress-safe); TTL index cleanup
- Protected GET /api/bookings + new PATCH /api/bookings/{id} {status: new|handled}
- /admin frontend: Tech Noir login page + dashboard (All/New/Handled filter tabs with counts, mark handled / reopen with persistence, refresh, logout, mobile-responsive); AuthContext with 401→refresh axios interceptor; "Owner login" link in footer
- Email alert to owner on every new booking via Emergent managed email (backend/email_service.py, guardrail gate, background task — booking always saves even if email fails). OWNER_EMAIL currently delivered@resend.dev PLACEHOLDER — awaiting user's real inbox
- Hardening after testing round: explicit CORS origin, secure/samesite on cookie deletion, public booking rate limit (5 per 15 min per IP)
- Testing: iteration_1 — backend 19/20 (only failure was brute-force-behind-ingress, since fixed + curl-verified 429 on public URL), frontend 100% flows incl. mobile 390px

### 2026-06 fork pt.2 (Scheduling + Statuses + Real Details)
- Real details: phone 905-512-0595, "Mobile service — Edmundston ↔ Grand Falls, NB", Cole Dunlop in About, mobile-service copy (no shop, drives to customers). Brand stays "CircuitWorks" placeholder + placeholder email by user's choice
- Online scheduling: 2-hour slots (10–12 / 12–14 / 14–16, Atlantic tz America/Moncton), booked slot + next slot (drive buffer) auto-unavailable, past days & passed same-day slots excluded; GET /api/availability?date= (public); slot chips in quote form with 409 conflict handling; DB unique partial index `unique_active_slot` closes double-booking race
- Admin availability panel (/admin → Availability tab): 28-day grid, tap to block/unblock days (GET/POST/DELETE /api/blocked-days, auth); blocked days show no slots publicly
- 3 statuses New→Accepted→Handled; customer emails on Accept ("confirmed, I come to you" + appointment) and Handled ("complete"); PATCH returns email_sent flag → honest toasts (warns if provider throttled); email send has 429 retry (3 attempts); repeated PATCH to same status doesn't resend
- Fixed: mobile horizontal overflow (marquee), overflow-x hidden on html/body
- Testing: iteration_2 — backend 34/35 pass (1 skip: provider throttle), frontend 100% flows; all 4 action items fixed + self-verified (curl + 390px screenshot)

## Files
- backend/server.py (auth + scheduling + bookings + seeding), backend/email_service.py (owner alert + status emails + guardrail gate)
- frontend/src/context/AuthContext.jsx, pages/AdminPage.jsx, components/admin/{AdminLogin,AdminDashboard,BookingCard,AvailabilityPanel}.jsx
- auth playbook tests: /app/auth_testing.md; backend tests: /app/backend/tests/backend_test.py

## Backlog
- P0: Business name + business email pending from user → then swap brand in site-data.js and OWNER_EMAIL/EMAIL_REPLY_TO in backend/.env (alerts currently go to delivered@resend.dev test inbox by user's choice)
- P2: Testimonials wall, FAQ, service-area map, real photos
- P2 (design nits from testing): shadcn Select/Calendar in booking form; label + hero-stat contrast bump

## Next Tasks
1. Get business name + email from user; swap placeholders + OWNER_EMAIL
2. Testimonials section
