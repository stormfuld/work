# CircuitWorks — PRD

## Original Problem Statement
"Build a landing page: I want to create a full website for my computer technician side business. I want it sleek and professional."

## User Choices (2026-08-28)
- Landing page + booking/quote request form saved for review
- Services: agent's choice fitting a computer tech business
- Look & feel: dark, sleek, techy
- Business details: user said they'd share; placeholders used for now (name "CircuitWorks", phone (555) 014-2273, hello@circuitworks.tech)

## Architecture
- Frontend: React 19 + Tailwind, framer-motion (scroll reveals, kinetic masked-line hero), lenis (smooth scrolling), react-fast-marquee (editorial marquee), sonner toasts, axios
- Backend: FastAPI, Motor (async MongoDB), Booking model with PyObjectId / to_mongo / from_mongo
- DB: MongoDB via MONGO_URL / DB_NAME env vars
- Design: "Tech Noir" — #050505 obsidian, #00F0FF neon cyan, Cabinet Grotesk / JetBrains Mono / IBM Plex Sans; sharp neo-brutalist corners, bento services grid

## Implemented (2026-08-28)
- Fixed glassmorphic nav with mono links + Request Quote CTA, mobile menu
- Hero: masked line-by-line kinetic reveal ("WE BRING DEAD HARDWARE BACK TO LIFE."), parallax server-lights background, stats strip
- Slow editorial marquee (outline text, services list)
- Manifesto: 4 numbered process chapters (Diagnostics / Surgery / Stress Test / Handover)
- Services bento grid: General Repair, Virus Removal, Upgrades, Networking, Data Recovery with hover glow + image zoom
- Pricing: 3 tiers ($49 diagnostic / from $99 standard / from $189 restoration), featured card glow
- About: grayscale technician photo, trust stats
- Booking form: POST /api/bookings (name, email, phone, device, service, preferred date, message) → saved to MongoDB, success state + toast; GET /api/bookings lists requests for review
- Typographic footer with "LET'S FIX IT." CTA and contact details

## User Personas
- Local customers with a broken/slow computer wanting fast, transparent repair
- Small office owners needing networking / maintenance help
- The owner (technician) reviewing incoming quote requests

## Backlog
- P0: Replace placeholder business details with real name/phone/email/location (user to provide)
- P1: Owner view to review bookings (currently GET /api/bookings is unauthenticated — needs auth before real use)
- P1: Email notification to owner on new booking (e.g. Resend)
- P2: Real photos of the actual workshop/technician
- P2: Testimonials section, FAQ, service-area map
- P2: Online scheduling (calendar picker with time slots)

## Next Tasks
1. Collect real business details and swap placeholders in /app/frontend/src/lib/site-data.js
2. Add auth + simple admin page for reviewing bookings
3. Wire email notifications on new booking
