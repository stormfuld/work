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

## Files
- backend/server.py (auth + bookings + seeding), backend/email_service.py
- frontend/src/context/AuthContext.jsx, pages/AdminPage.jsx, components/admin/{AdminLogin,AdminDashboard}.jsx
- auth playbook tests: /app/auth_testing.md; backend tests: /app/backend/tests/backend_test.py

## Backlog
- P0: Replace placeholder business details (name/phone/email/location) in frontend/src/lib/site-data.js AND set real OWNER_EMAIL + EMAIL_REPLY_TO in backend/.env — user must provide
- P2: Testimonials wall, FAQ, service-area map, real workshop photos
- P2: Online scheduling (calendar time slots)
- P2 (design nits from testing): shadcn Select/Calendar in booking form; bump label contrast (zinc-600 → zinc-500)

## Next Tasks
1. Collect real business details from user; swap placeholders + OWNER_EMAIL
2. Testimonials section
