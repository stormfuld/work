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

### 2026-06 fork pt.3 (Coverage Checker)
- "Am I in your area?" section (id #coverage, nav link "Coverage", between About and Booking; booking renumbered 06): telecom-style postal code checker
- GET /api/service-area?postal_code= (public): validates CA postal format, geocodes FSA via api.zippopotam.us/CA/{fsa} (cached in db.fsa_cache), computes distance to Edmundston(47.3614,-68.3218)–Grand Falls(47.052,-67.7368) corridor segment; in_area = ≤20 km (SERVICE_RADIUS_KM in server.py)
- In-area → cyan "You're covered" + quote CTA; out-of-area → amber "Outside my usual run" + call/text 905-512-0595 link + "send a request anyway" (never blocks); 400 invalid format, 404 unknown FSA, 503 lookup down
- Self-tested: curl all cases (Edmundston 0km, Saint-Basile 3.8km in, Moncton 253km out, Toronto out, invalid, unknown) + screenshots of both result states

## Files
- backend/server.py (auth + scheduling + bookings + seeding), backend/email_service.py (owner alert + status emails + guardrail gate)
- frontend/src/context/AuthContext.jsx, pages/AdminPage.jsx, components/admin/{AdminLogin,AdminDashboard,BookingCard,AvailabilityPanel}.jsx
- auth playbook tests: /app/auth_testing.md; backend tests: /app/backend/tests/backend_test.py

### 2026-08-29 (Service Scope Update)
- SERVICES rewritten to match actual offering: Hardware & OS Diagnostics (charging, batteries, drives, ports, screen tearing — no cracked screens), Virus & Malware Removal, Program & OS Setup, Account Help (Apple/Gmail/Microsoft etc.), Networking, Data Recovery & Backup
- Removed "Upgrades & Custom Builds" from the on-site quote flow — custom PC builds are now a separate off-form quote (contact directly); "Custom build" removed from booking form device options
- Added SERVICE_EXCLUSIONS list (no cracked screens, no liquid damage — refer out, custom builds by quote) surfaced on the booking form next to contact info
- Hero subtitle and pricing tier copy updated to drop cracked-screen/liquid-damage/upgrade language

### 2026-08-29 pt.2 (Service Area → Drive-Time Based)
- Replaced straight-line corridor/20km-radius logic with real driving time from Edmundston via OSRM public routing API (router.project-osrm.org); in_area = ≤90 min drive from Edmundston (MAX_DRIVE_MINUTES in server.py)
- Straight-line-distance fallback (assumed 70 km/h avg) kicks in only if OSRM is unreachable, so the checker never hard-fails
- fsa_cache now stores drive_minutes alongside lat/lng/place; existing cached entries auto-backfill on next lookup
- Frontend copy updated to talk in drive-time ("about 45 min from Edmundston" / "outside my usual 1.5 hour range") instead of km
- Caveat: OSRM's public demo server has no SLA/rate-limit guarantee — fine for this traffic level, but worth swapping to a paid routing API (e.g. Google Distance Matrix) if this ever needs to be bulletproof

## Backlog
- P0: Business name + business email pending from user → then swap brand in site-data.js and OWNER_EMAIL/EMAIL_REPLY_TO in backend/.env (alerts currently go to delivered@resend.dev test inbox by user's choice)
- P2: Testimonials wall, FAQ, service-area map, real photos
- P2 (design nits from testing): shadcn Select/Calendar in booking form; label + hero-stat contrast bump

## Next Tasks
1. Get business name + email from user; swap placeholders + OWNER_EMAIL
2. Testimonials section
