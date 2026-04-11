# CLAUDE.md — bookingapp

Instrukcje dla Claude Code w tym projekcie. Komunikacja: **polski**.

## Czym jest projekt
Platforma rezerwacji treningow dla **Milosza Kornasiewicza** (zawodnik MMA, klub MMA Krosno). MVP single-tenant, docelowo wielotenantowy SaaS (Phase 3: Paulina, Radek; Phase 4: branza beauty).

Pelny plan implementacji: [docs/PLAN.md](docs/PLAN.md)
Aktualny stan: [docs/STATE.md](docs/STATE.md)

## Stack
- React 19 + Vite 7 + TypeScript 5.9 + Tailwind v4
- Firebase (Firestore `europe-central2`, Functions v2 nodejs20, Auth, Hosting)
- Stripe Connect Express (karta + BLIK + P24) — Tydzien 2
- Google Calendar API (2-way sync) — Tydzien 2
- Email: Resend (rekomendacja) — Tydzien 3

## Workspaces (npm)
- `./` — aplikacja PWA (Vite + React)
- `packages/shared-types/` — wspolne typy (`@bookingapp/shared-types`)
- `functions/` — Firebase Functions v2

## Komendy
```bash
npm install                 # zainstaluj wszystkie workspaces
npm run dev                 # Vite dev server (port 5173)
npm run build               # tsc -b && vite build
npm run emulators           # Firebase emulators (auth/firestore/functions)
npm run deploy:dev          # firebase deploy --project bookingapp-dev
npm run deploy:prod         # firebase deploy --project bookingapp-prod

# functions
cd functions && npx tsc     # build TS
```

## Konwencje
- **Strict TS** — wszystkie hooki/komponenty typowane przez `@bookingapp/shared-types`.
- **`tenantId` na kazdym dokumencie** — multi-tenant izolacja przez `firestore.rules` (`isTenantMember(tid)`).
- **Stripe Connect z `application_fee_amount = 15%`** — flat fee, free signup, undercut Booksy.
- **Region `europe-central2`** wszedzie (Firestore + Functions) dla RODO.
- **Ceny w groszach** (`Service.price = 18000` = 180 PLN).
- **Sloty: `TimeSlot { start, end }` w formacie `HH:mm`**, dni tygodnia jako `'mon'|'tue'|...|'sun'`.
- **Status `pending_payment` przy create** — security rules blokuja inny status na create.
- **Vouchery `update`/`delete` tylko z funkcji** — nie z klienta.
- **PL kopia w UI** — bez polskich znakow w stringach kodzie (escape do ASCII), polskie znaki tylko w JSX content (UTF-8 OK).

## Krytyczne pliki referencyjne (do portowania)
- `c:\Users\mikep\fundacjalovevibe\fundacjalovevibe-be\functions\src\triggers\onBookingChange.ts` — wzorzec Tydzien 2
- `c:\Users\mikep\fundacjalovevibe\fundacjalovevibe-be\functions\src\calendar\events.ts` — Google Calendar
- `c:\Users\mikep\fundacjalovevibe\fundacjalovevibe-be\functions\src\email\` — szablony emaili
- `c:\Users\mikep\kettleforce\` — komponenty bookingowe (juz sportowane)

## Co NIE wchodzi w MVP
WhatsApp/SMS, no-show preauth, waitlist, substitute trainer, PDF faktury, multi-tenant signup wizard, native mobile (PWA wystarczy), beauty vertical.
