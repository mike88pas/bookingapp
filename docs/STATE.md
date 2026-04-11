# bookingapp — Stan projektu

**Ostatnia aktualizacja:** 2026-04-11
**Faza:** Phase 1 MVP, koniec **Tydzien 1 — Foundation**

## Co dziala
- ✅ Repo zainicjalizowane, npm workspaces (`./`, `packages/shared-types/`, `functions/`)
- ✅ Vite 7 + React 19 + TS 5.9 + Tailwind v4 + RRv7 (build OK, 587 KB → 184 KB gzip)
- ✅ Pelny data model w `packages/shared-types/src/index.ts` (Tenant, TrainerProfile, Service, Booking, Package, Voucher, Payment, Availability, AvailabilityException, Client, UserRoleDoc + helpery)
- ✅ AuthContext + TenantContext + guards (ProtectedRoute, TrainerRoute, AdminRoute) — port z fundacjalovevibe-be, zgeneralizowane na role bookingapp
- ✅ Hooki: `useAuth`, `useTenant`, `useAvailability`, `useBookings`
- ✅ Komponenty bookingowe sportowane z kettleforce + zaadaptowane do nowych typow:
  `WeeklyCalendar`, `BookingForm`, `BookingConfirmation`, `ServicePicker`
- ✅ Komponenty publiczne: `TenantHero`, `PartnerClubCard`, `AchievementsList`, `GiftVoucherCTA`
- ✅ Komponenty dashboard: `BookingCard`, `BookingDetailsModal` (refactored `therapist*` → `trainer*`)
- ✅ AvailabilityManager — port z fundacjalovevibe-be, nowy model dni tygodnia (`mon|tue|...`) + scalanie godzinowych blokow w `TimeSlot[]`
- ✅ GoogleCalendarConnect (stub do Tydzien 2)
- ✅ Strony: `HomePage`, `TenantPage` (renderuje live z Firestore), `VoucherPurchasePage` (stub), `VoucherRedeemPage` (stub), `ConfirmationPage` (stub), `Login`, `Dashboard`
- ✅ Logika slotow: `src/lib/slots.ts::computeSlots()` — generuje sloty z Availability + duration, usuwa kolizje z bookingami
- ✅ Firebase init: `firebase.json`, `.firebaserc` (`bookingapp-dev`/`bookingapp-prod`), `firestore.rules` (multi-tenant izolacja z planu), `firestore.indexes.json`
- ✅ Functions skeleton: `functions/src/index.ts` + `config.ts` (region `europe-central2`, eksporty zakomentowane)
- ✅ Seed Milosza: `scripts/seed-milosz.ts` (tworzy tenant + trainer + 4 uslugi: 1-on-1, group MMA, sparring, boks)

## Buildy zielone
```
npx tsc -b                 ✅
npx vite build             ✅
cd functions && npx tsc    ✅
```

## Co trzeba zrobic przed pierwszym `npm run dev` na zywo
1. **Stworzyc projekty Firebase** w konsoli https://console.firebase.google.com :
   - `bookingapp-dev` (region: `europe-central2`)
   - `bookingapp-prod` (region: `europe-central2`)
2. W obu projektach: wlaczyc **Authentication → Email/Password**, **Firestore Database**, **Functions** (wymaga Blaze plan)
3. Pobrac web config z Project Settings → "Add app" (web), wkleic do `.env.local` (template: `.env.example`)
4. `firebase login` + `firebase use bookingapp-dev`
5. Uruchomic emulator: `npm run emulators`, w drugim terminalu: `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npx tsx scripts/seed-milosz.ts`
6. `npm run dev` → otworzyc http://localhost:5173/b/milosz-mma

## Tydzien 2 — TODO (Booking + Payments + Calendar)
- [ ] **Stripe Connect setup**
  - [ ] Utworzyc konto Stripe (test mode), zapisac `STRIPE_SECRET_KEY` jako Functions secret
  - [ ] `functions/src/stripe/connect.ts` — `createConnectAccount`, `createOnboardingLink`
  - [ ] `StripeConnectOnboard.tsx` w dashboardzie → Settings
- [ ] **`createCheckoutSession` HTTP callable** (`functions/src/http/createCheckoutSession.ts`):
  - input: `{ bookingId }`
  - czyta booking, czyta tenant.stripeAccountId
  - tworzy Stripe Checkout Session z `application_fee_amount = price * 0.15`, `payment_method_types: ['card', 'p24', 'blik']`
  - zwraca `sessionUrl`
- [ ] **`stripeWebhook` HTTP** (`functions/src/http/stripeWebhook.ts`):
  - obsluga `payment_intent.succeeded` → update booking `confirmed`, create `payment` doc
  - obsluga `payment_intent.payment_failed` → update booking `cancelled`, payment `failed`
- [ ] **`onBookingChange` trigger** (`functions/src/triggers/onBookingChange.ts`) — port z fundacjalovevibe-be:
  - na status confirmed: utworz Google Calendar event + wyslij email PL
  - na status cancelled: usun event + wyslij email cancellation
- [ ] **Google OAuth flow**:
  - `functions/src/http/googleOAuth.ts` — port z fundacjalovevibe-be
  - przycisk "Polacz Google Calendar" w GoogleCalendarConnect.tsx → otwiera flow → zapisuje `googleRefreshToken` (encrypted)
- [ ] **`functions/src/calendar/events.ts`** — port 1:1 z fundacjalovevibe-be (`createEvent`, `updateEvent`, `deleteEvent`, `createMeetLink`)
- [ ] **Email sender** — `functions/src/email/sendEmail.ts` (Resend API), templates PL: `bookingConfirmed.ts`, `cancelled.ts`
- [ ] **BookingForm submit handler** (`TenantPage.tsx`):
  - utworz `booking{status:pending_payment}` w Firestore
  - wywolaj `httpsCallable('createCheckoutSession')` → redirect do `sessionUrl`
- [ ] **`ConfirmationPage`** — pobierz booking po `bookingId`, pokaz `BookingConfirmation` lub stan failed
- [ ] **Pakiety**:
  - `PackagePicker.tsx` na TenantPage
  - `createCheckoutSession` z `mode: 'package'` → po platnosci tworzy `package{status:active, expiresAt:+60d}`
  - Booking z aktywnym pakietem: `paymentMethod:'package'`, dec `usedSessions` (transaction)

## Tydzien 3 — TODO (Vouchers + Dashboard + Reminders + Deploy)
- [ ] **Vouchery** (`createVoucherCheckout`, `onVoucherCreate` trigger, `VoucherPurchaseForm`, `VoucherRedeemPage`)
- [ ] **Generator kodu**: `functions/src/lib/codeGen.ts` (8-char base32)
- [ ] **Trainer dashboard**: TodaySchedule, lista bookingow z filtrem, CRUD services, AvailabilityManager hookup, lista pakietow+voucherow, lista klientow
- [ ] **Email reminders cron**: `functions/src/scheduled/emailReminderDispatch.ts` (co 15 min, 24h + 2h przed)
- [ ] **`packageExpiryCheck` cron** (codziennie)
- [ ] **PWA**: manifest + service worker + ikona
- [ ] **Deploy**: `bookingapp-dev.web.app` + `bookingapp-prod.web.app`

## Open questions (z planu, do rozstrzygniecia)
1. Czy Milosz ma konto Stripe? Potrzebny onboarding ~15 min.
2. Email sender: **Resend** (rekomendacja) vs SendGrid?
3. Voucher code format: 8 znakow base32 (rekomendacja)
4. Voucher expiry default: **12 mies.**?
5. Package expiry: **60 dni + rollover 3 sesji**?
6. Cancellation policy: **24h pelny refund, <24h 0%**?
7. MMA Krosno: jakie info do PartnerClubCard? (logo, adres, URL)

## Krytyczne pliki referencyjne (Tydzien 2)
- `c:\Users\mikep\fundacjalovevibe\fundacjalovevibe-be\functions\src\triggers\onBookingChange.ts`
- `c:\Users\mikep\fundacjalovevibe\fundacjalovevibe-be\functions\src\calendar\events.ts` + `auth.ts`
- `c:\Users\mikep\fundacjalovevibe\fundacjalovevibe-be\functions\src\email\sendEmail.ts` + `templates.ts`
