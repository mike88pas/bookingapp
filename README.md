# bookingapp

Platforma bookingowa dla trenerów sportów walki i fitness. Single-tenant (Milosz Kornasiewicz / MMA Krosno) w Phase 1, wielotenantowy SaaS od Phase 3.

**Pełny plan:** [docs/PLAN.md](docs/PLAN.md)

## Stack
- React 19 + Vite + TypeScript + Tailwind v4
- Firebase (Firestore `europe-central2`, Functions v2, Auth, Hosting)
- Stripe Connect Express (card + BLIK + P24)
- Google Calendar API (2-way sync)

## Workspaces
- `./` — aplikacja PWA (Vite + React)
- `packages/shared-types/` — wspolne typy (Tenant, Booking, Voucher, Package, Payment)
- `functions/` — Firebase Functions v2 (triggers, HTTP, scheduled)

## Dev
```bash
npm install
npm run dev                 # Vite dev server
npm run emulators           # Firebase emulators (functions, firestore, auth)
```

## Deploy
```bash
npm run deploy:dev          # bookingapp-dev.web.app
npm run deploy:prod         # bookingapp-prod.web.app
```
