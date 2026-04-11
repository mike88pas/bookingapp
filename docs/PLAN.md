# bookingapp — Plan Implementacji (MVP → SaaS → Beauty)

## Context

Nowy projekt **bookingapp** dla kolegi-trenera **Milosza Kornasiewicza** (zawodnik MMA, trener sztuk walki). Milosz potrzebuje narzędzia do bookowania treningów 1-on-1, treningów grupowych oraz prezentowania siebie i klubu **MMA Krosno** gdzie trenuje. Klienci mają móc kupować pojedyncze treningi, pakiety oraz **vouchery prezentowe** (trening na urodziny/święta itp.).

Strategicznie: ten sam kod ma stać się **wielotenantowym SaaSem** dla:
- **Phase 1:** Milosz Kornasiewicz (single tenant, walidacja produktu)
- **Phase 3:** Paulina (TreningMama) + Radek (IronCoach/KettleForce)
- **Phase 4:** branża beauty (fryzjer/barber/kosmetyczka) — extensible vertical model

Codename **bookingapp**, decyzja brandowa po MVP.

**Repo:** https://github.com/mike88pas/bookingapp.git (utworzone przez chefa)
**Lokalna lokalizacja:** `c:\Users\mikep\bookingapp\` (sklonujemy tu po zatwierdzeniu planu, chef otworzy w nowej instancji VS Code)

**Decyzje biznesowe (potwierdzone):**
- MVP scope = booking + Stripe + pakiety + **gift vouchers**
- Monetyzacja = flat **15% transaction fee** (free signup, brak subskrypcji), undercut Booksy
- Reminders w MVP = **email** (24h + 2h przed treningiem)
- Stack = React 19 + Vite + TS + Tailwind + Firebase (zgodne z resztą ekosystemu)
- Płatności = **Stripe Connect Express** (karta + BLIK + Przelewy24) + cash fallback
- Region Firestore = `europe-central2` (RODO)

**Gap rynkowy który adresujemy:**
- Booksy = 20%+ fee, beauty-first, słabo dla solo trenerów
- Calendly = brak płatności PL natively
- Fitssey/eFitness = enterprise-only
- **Nikt nie łączy:** vouchery prezentowe + pakiety z expiry/rollover + group+1on1 hybrid + Stripe split 80/15 + landing strony klubu/trenera w jednym

---

## Architecture Overview

```
PWA (React 19 + Vite + TS + Tailwind)
├── /                              landing bookingapp (Phase 3)
├── /b/:tenantSlug                 PUBLIC strona Milosza:
│                                    - hero + bio + mistrzostwa
│                                    - sekcja "Klub MMA Krosno" (partner card)
│                                    - usługi: 1-on-1, group classes
│                                    - kalendarz tygodniowy + booking
│                                    - "Kup w prezencie" CTA → voucher flow
│                                    - pakiety (karnet 10x)
├── /b/:slug/voucher               formularz voucher (kupujący ≠ obdarowany)
├── /v/:voucherCode                redemption page (obdarowany wpisuje kod, bookuje)
├── /app/dashboard                 trainer dashboard (auth)
│   ├── /bookings, /services, /availability, /clients, /packages, /vouchers, /payments
└── /admin                         super_admin (Phase 3)
        │
        ▼
Firebase Functions v2 (europe-central2)
├── HTTP:    createCheckoutSession, createVoucherCheckout, redeemVoucher
├── HTTP:    stripeWebhook, googleOAuthCallback
├── Trigger: onBookingChange (calendar event + email)
├── Trigger: onPaymentChange (mark booking/voucher/package paid)
├── Trigger: onVoucherCreate (generate code + send email do obdarowanego)
└── Scheduled: emailReminderDispatch (co 15 min), packageExpiryCheck (codziennie)
        │
        ▼
Firestore (multi-tenant via tenantId) + Stripe Connect + Google Calendar API
```

**Multi-tenant strategia:** single Firebase project, każdy dokument ma `tenantId`, security rules izolują dane per tenant. Subdomeny per tenant odkładamy na Phase 3.

---

## Data Model (Firestore)

Wszystkie typy w `packages/shared-types/src/index.ts`. Reużywane przez `src/` (Vite app) i `functions/src/`.

```ts
type Vertical = 'fitness' | 'beauty' | 'wellness';
type ServiceCategory = 'mma' | 'fitness' | 'yoga' | 'physio' | 'beauty';
type UserRole = 'client' | 'trainer' | 'tenant_admin' | 'super_admin';
type BookingStatus =
  | 'pending_payment' | 'confirmed' | 'cancelled_by_client'
  | 'cancelled_by_trainer' | 'no_show' | 'completed';
type PaymentMethod = 'stripe_card' | 'blik' | 'p24' | 'cash' | 'package' | 'voucher';
type PaymentStatus = 'none' | 'preauth' | 'captured' | 'refunded' | 'failed';
type VoucherStatus = 'pending_payment' | 'active' | 'redeemed' | 'expired' | 'refunded';

interface Tenant {
  id: string; slug: string;            // "milosz-mma"
  displayName: string; vertical: Vertical;
  ownerUid: string;
  stripeAccountId?: string; stripeOnboardingComplete: boolean;
  platformFeePct: number;              // 15 default
  currency: 'PLN' | 'EUR'; timezone: string; locale: 'pl' | 'en';
  brandColor?: string; logoUrl?: string; coverUrl?: string;
  partnerClub?: { name: string; address: string; url?: string; logoUrl?: string };
  plan: 'free' | 'starter' | 'pro';
  createdAt: Timestamp; active: boolean;
}

interface TrainerProfile {
  id: string; tenantId: string; uid: string;
  name: string; role: string; category: ServiceCategory;
  specializations: string[]; achievements: string[];   // mistrzostwa MMA
  photoUrl?: string; bio?: string; phone: string; email: string;
  googleCalendarConnected: boolean;
  googleRefreshToken?: string;          // encrypted, functions-only
  googleCalendarId?: string;
  active: boolean;
}

interface Service {
  id: string; tenantId: string; trainerId: string;
  name: string; category: ServiceCategory;
  durationMin: number; price: number;   // grosze
  currency: 'PLN' | 'EUR'; description?: string;
  maxParticipants: number;              // 1 = 1-on-1, >1 = group class
  giftEligible: boolean;                // czy można kupić jako voucher
  requiresPreauth: boolean;             // Phase 2 — no-show fee
  noShowFee?: number;
  active: boolean;
}

interface Availability {
  id: string;                           // `${trainerId}_${dow}`
  tenantId: string; trainerId: string;
  dayOfWeek: 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun';
  slots: { start: string; end: string }[]; // ISO HH:mm
  active: boolean;
}

interface AvailabilityException {
  id: string; tenantId: string; trainerId: string;
  date: string;                         // "2026-04-20"
  type: 'unavailable' | 'custom';
  customSlots?: { start: string; end: string }[];
  reason?: string;
}

interface Booking {
  id: string; tenantId: string;
  trainerId: string; trainerName: string;
  clientId: string; clientName: string; clientEmail: string; clientPhone: string;
  serviceId: string; serviceName: string; servicePrice: number;
  status: BookingStatus;
  startAt: Timestamp; endAt: Timestamp; durationMin: number;
  paymentMethod: PaymentMethod; paymentStatus: PaymentStatus;
  paymentId?: string; packageId?: string; voucherId?: string;
  stripePaymentIntentId?: string;
  googleCalendarEventId?: string;
  locationType: 'onsite' | 'online' | 'client_location';
  locationAddress?: string;
  notes?: string; trainerNotes?: string;
  reminder24hSentAt?: Timestamp; reminder2hSentAt?: Timestamp;
  participants?: { clientId: string; name: string }[]; // group classes
  cancelledAt?: Timestamp; cancellationReason?: string;
  createdAt: Timestamp; updatedAt: Timestamp;
}

interface Package {
  id: string; tenantId: string; clientId: string; trainerId: string;
  serviceId: string;
  totalSessions: number; usedSessions: number; rolloverAllowed: number;
  purchasedAt: Timestamp; expiresAt: Timestamp;
  price: number; paymentId?: string;
  status: 'active' | 'expired' | 'used_up' | 'refunded';
}

interface Voucher {
  id: string; tenantId: string;
  code: string;                         // unique 8-char alphanum, np. "MMA-X7K2"
  serviceId?: string;                   // konkretna usługa
  amount?: number;                      // ALTERNATYWNIE: voucher kwotowy
  buyerName: string; buyerEmail: string;
  recipientName: string; recipientEmail?: string;
  message?: string;                     // dedykacja
  occasion?: 'birthday' | 'christmas' | 'valentines' | 'other';
  status: VoucherStatus;
  paymentId?: string; stripePaymentIntentId?: string;
  redeemedBookingId?: string; redeemedAt?: Timestamp;
  expiresAt: Timestamp;                 // np. +12 miesięcy
  createdAt: Timestamp;
}

interface Client {
  id: string; tenantId: string; uid?: string;
  name: string; email: string; phone: string;
  totalBookings: number; completedBookings: number; noShowCount: number;
  tags: string[]; notes?: string;
  createdAt: Timestamp;
}

interface Payment {
  id: string; tenantId: string;
  bookingId?: string; packageId?: string; voucherId?: string;
  clientId?: string; buyerEmail?: string;
  amount: number; platformFee: number; trainerAmount: number;
  currency: 'PLN' | 'EUR';
  method: PaymentMethod; status: PaymentStatus;
  stripePaymentIntentId?: string; stripeChargeId?: string; stripeTransferId?: string;
  refundedAmount?: number;
  createdAt: Timestamp;
}

interface UserRoleDoc {
  uid: string; email: string; role: UserRole;
  tenantId?: string; trainerId?: string; createdAt: Timestamp;
}
```

---

## Directory Structure

```
bookingapp/
├── firebase.json, .firebaserc, firestore.rules, firestore.indexes.json
├── package.json                          (npm workspaces)
├── packages/shared-types/src/index.ts
├── src/
│   ├── main.tsx, App.tsx, router.tsx
│   ├── lib/ firebase.ts, auth.ts, firestore.ts, stripe.ts
│   ├── contexts/ AuthContext.tsx, TenantContext.tsx
│   ├── components/
│   │   ├── public/ TenantHero.tsx, PartnerClubCard.tsx, AchievementsList.tsx, GiftVoucherCTA.tsx
│   │   ├── booking/ WeeklyCalendar.tsx, BookingForm.tsx, BookingConfirmation.tsx, ServicePicker.tsx, GroupClassCard.tsx
│   │   ├── voucher/ VoucherPurchaseForm.tsx, VoucherRedeemForm.tsx, OccasionPicker.tsx
│   │   ├── packages/ PackagePicker.tsx, PackageCard.tsx
│   │   ├── dashboard/ BookingCard.tsx, BookingDetailsModal.tsx, TodaySchedule.tsx, StatsCard.tsx
│   │   ├── availability/ AvailabilityManager.tsx, ExceptionCalendar.tsx
│   │   ├── integrations/ GoogleCalendarConnect.tsx, StripeConnectOnboard.tsx
│   │   ├── guards/ ProtectedRoute.tsx, TrainerRoute.tsx, AdminRoute.tsx
│   │   └── ui/
│   ├── pages/
│   │   ├── public/ TenantPage.tsx, VoucherPurchasePage.tsx, VoucherRedeemPage.tsx, ConfirmationPage.tsx
│   │   ├── app/ Dashboard.tsx, Bookings.tsx, Services.tsx, Availability.tsx, Clients.tsx, Packages.tsx, Vouchers.tsx, Payments.tsx, Settings.tsx
│   │   └── admin/ TenantsList.tsx
│   └── hooks/ useTenant, useBookings, useAvailability, useStripeCheckout, useVoucher
└── functions/src/
    ├── index.ts, config.ts
    ├── lib/ firestore.ts, auth.ts, errors.ts, codeGen.ts
    ├── triggers/ onBookingChange.ts, onPaymentChange.ts, onVoucherCreate.ts
    ├── http/ createCheckoutSession.ts, createVoucherCheckout.ts, redeemVoucher.ts, stripeWebhook.ts, googleOAuth.ts
    ├── calendar/ auth.ts, events.ts
    ├── email/ sendEmail.ts, templates/{bookingConfirmed,reminder24h,reminder2h,voucherPurchased,voucherRecipient,packagePurchased,cancelled}.ts
    ├── stripe/ connect.ts, refunds.ts
    └── scheduled/ emailReminderDispatch.ts, packageExpiryCheck.ts
```

---

## MVP Scope (Phase 1) — 3 tygodnie

### Tydzień 1 — Foundation
- Init repo, `npm workspaces`, Vite + React 19 + TS + Tailwind + RRv7, Firebase init (dev+prod projects, region `europe-central2`)
- `packages/shared-types` z całym data modelem powyżej
- `firestore.rules` v1 (multi-tenant izolacja, public read na `tenants/trainers/services/availability`)
- AuthContext + TenantContext + role guards (port z `fundacjalovevibe-be/src/components/AuthContext.tsx`)
- Skopiowanie i adaptacja komponentów (lista w sekcji "Files to port")
- Seed Milosza: `tenants/milosz-mma`, `trainers/milosz`, 3-5 services (1-on-1 60min, group MMA, sparring, etc.), partnerClub = MMA Krosno
- Public page `/b/milosz-mma` renderuje hero + bio + osiągnięcia + partner club card + lista usług + WeeklyCalendar (live z Firestore)

### Tydzień 2 — Booking + Payments + Calendar
- `BookingForm.tsx` → tworzy `booking{status:pending_payment}` → `createCheckoutSession` cloud function → Stripe Checkout (Connect, fee=15%)
- `stripeWebhook.ts` → na `payment_intent.succeeded`: update booking → `confirmed`, create `payment` doc
- `onBookingChange.ts` trigger → Google Calendar event (port z `fundacjalovevibe-be/functions/src/calendar/events.ts`) + email confirmation (PL template)
- Google OAuth flow dla Milosza (ustawienia → "Połącz Google Calendar")
- **Pakiety:** `PackagePicker.tsx` na public page, `createCheckoutSession` z `mode:'package'`, po opłacie tworzy `package{status:active, expiresAt:+60d}`
- Klient z aktywnym pakietem może bookować bez płatności (`paymentMethod:'package'`, dec `usedSessions`)

### Tydzień 3 — Vouchers + Dashboard + Reminders + Deploy
- **Vouchery:** `VoucherPurchaseForm.tsx` (kupujący wypełnia: serwis, dane swoje, dane obdarowanego, dedykacja, okazja) → `createVoucherCheckout` → Stripe → `voucher{status:active, code:generated, expiresAt:+12mo}`
- `onVoucherCreate.ts` trigger → wysyła email do **buyera** (potwierdzenie) i do **recipienta** (kod + link `/v/:code` + dedykacja)
- `VoucherRedeemPage.tsx` → wpisanie kodu → wybór slota → booking z `paymentMethod:'voucher'`, mark voucher `redeemed`
- **Trainer dashboard:** `TodaySchedule`, lista bookingów (filter status), CRUD services, AvailabilityManager, lista pakietów+voucherów, lista klientów
- **Email reminders:** `emailReminderDispatch.ts` cron co 15 min, query `bookings where status=confirmed AND startAt between now+23h45m..now+24h15m AND reminder24hSentAt==null` (+ analogicznie dla 2h)
- PWA manifest + service worker + ikona
- Deploy `bookingapp-dev.web.app` + `bookingapp-prod.web.app`, end-to-end test booking + voucher + pakiet + reminder

### Co NIE wchodzi w MVP
- WhatsApp/SMS reminders (Phase 2)
- No-show preauth + auto-capture (Phase 2)
- Substitute trainer flow (Phase 2)
- Waitlist + AI slot packing (Phase 2)
- PDF invoice generation (Phase 2)
- Multi-tenant self-service signup (Phase 3)
- Beauty vertical (Phase 4)
- Native mobile app — PWA wystarczy

---

## Files to Port (źródło → docelowo)

**Z `c:\Users\mikep\fundacjalovevibe\fundacjalovevibe-be\` (best-in-class booking, 100% production):**
- [src/components/BookingCard.tsx](c:/Users/mikep/fundacjalovevibe/fundacjalovevibe-be/src/components/BookingCard.tsx) → `src/components/dashboard/BookingCard.tsx` (refactor `therapist*` → `trainer*`, dodać `tenantId`)
- [src/components/BookingDetailsModal.tsx](c:/Users/mikep/fundacjalovevibe/fundacjalovevibe-be/src/components/BookingDetailsModal.tsx) → `src/components/dashboard/BookingDetailsModal.tsx`
- [src/components/AvailabilityManager.tsx](c:/Users/mikep/fundacjalovevibe/fundacjalovevibe-be/src/components/AvailabilityManager.tsx) → `src/components/availability/AvailabilityManager.tsx` (+ rozszerzyć o `AvailabilityException`)
- [src/components/GoogleCalendarConnect.tsx](c:/Users/mikep/fundacjalovevibe/fundacjalovevibe-be/src/components/GoogleCalendarConnect.tsx) → `src/components/integrations/GoogleCalendarConnect.tsx`
- `src/components/AuthContext.tsx` → `src/contexts/AuthContext.tsx` (dodać `tenantId`, `role` z `roles/{uid}`)
- `src/components/{ProtectedRoute,TherapistRoute,AdminRoute}.tsx` → `src/components/guards/` (zgeneralizuj na role)
- `src/lib/types.ts` → inspiracja dla `packages/shared-types/src/index.ts`
- [functions/src/triggers/onBookingChange.ts](c:/Users/mikep/fundacjalovevibe/fundacjalovevibe-be/functions/src/triggers/onBookingChange.ts) → `functions/src/triggers/onBookingChange.ts` (zamień `therapistId`→`trainerId`, dodać routing per tenant)
- [functions/src/calendar/events.ts](c:/Users/mikep/fundacjalovevibe/fundacjalovevibe-be/functions/src/calendar/events.ts) + `auth.ts` → `functions/src/calendar/` 1:1
- `functions/src/email/sendEmail.ts` + `templates.ts` → `functions/src/email/` (dodać PL templates dla voucherów+pakietów)

**Z `c:\Users\mikep\kettleforce\`:**
- `src/components/booking/WeeklyCalendar.tsx` → `src/components/booking/WeeklyCalendar.tsx` (replace mock data → live Firestore query `useAvailability(trainerId)`)
- `src/components/booking/BookingForm.tsx` → `src/components/booking/BookingForm.tsx` (po submit: `createCheckoutSession`)
- `src/components/booking/BookingConfirmation.tsx` → `src/components/booking/BookingConfirmation.tsx`
- `src/lib/types.ts:72-96` (Trainer interface) → merge do `shared-types` jako `TrainerProfile`

---

## Payment Flow (sequence)

```
Klient (public /b/milosz-mma)         Web              Functions          Stripe          Firestore
   │ wybiera slot + service ────────▶ │                  │                  │                 │
   │ wypełnia BookingForm             │                  │                  │                 │
   │                                  │─createBooking({status:pending_payment})───────────────▶│
   │                                  │─httpsCallable createCheckoutSession(bookingId)──▶│     │
   │                                  │                  │ checkout.session.create          │
   │                                  │                  │  (Connect account=stripeAccountId│
   │                                  │                  │   application_fee_amount=15%,    │
   │                                  │                  │   payment_method_types=[card,p24,blik])
   │                                  │◀──sessionUrl──── │                                  │
   │◀───redirect Stripe hosted────────│                  │                                  │
   │ pays (BLIK/karta/P24) ─────────────────────────────▶│                                  │
   │                                                     │─webhook payment_intent.succeeded▶│
   │                                                     │  stripeWebhook.ts updates:       │
   │                                                     │  booking.status=confirmed        │
   │                                                     │  booking.paymentStatus=captured  │
   │                                                     │  create payment doc              │
   │                                                     │                  ▼               │
   │                                                     │  onBookingChange trigger fires:  │
   │                                                     │  1. create Google Calendar event │
   │                                                     │  2. send email confirmation PL   │
   │◀───redirect /b/milosz-mma/confirmation/:bookingId───────────────────────────────────────│
```

**Voucher flow:** identyczny ale `mode='voucher_purchase'`, po sukcesie `voucher{code, status:active}` + 2 emaile (buyer + recipient z linkiem `/v/:code`).

**Pakiet flow:** identyczny ale `mode='package_purchase'`, po sukcesie `package{totalSessions, expiresAt:+60d}`. Booking z pakietu pomija Stripe (`paymentMethod:'package'`, dec `usedSessions`).

**Cash:** `booking.paymentMethod='cash'`, `status='confirmed'` od razu (skip Stripe), trener ręcznie `markPaid` po sesji w dashboardzie.

**Refunds:** cancel ≥24h przed = pełny refund (cron + manual button); <24h = brak refundu (konfigurowalne per tenant w `Settings`).

---

## Security Rules (szablon `firestore.rules`)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function myRole()     { return get(/databases/$(database)/documents/roles/$(request.auth.uid)).data; }
    function isSuperAdmin(){ return isSignedIn() && myRole().role == 'super_admin'; }
    function isTenantMember(tid) {
      return isSignedIn() && myRole().tenantId == tid &&
             (myRole().role == 'trainer' || myRole().role == 'tenant_admin');
    }
    function sameTenant(tid) { return request.resource.data.tenantId == tid; }

    match /tenants/{tenantId}        { allow read: if true;
                                       allow write: if isSuperAdmin() || isTenantMember(tenantId); }
    match /trainers/{id}             { allow read: if true;
                                       allow write: if isSuperAdmin() || isTenantMember(resource.data.tenantId); }
    match /services/{id}             { allow read: if true;
                                       allow write: if isTenantMember(resource.data.tenantId); }
    match /availability/{id}         { allow read: if true;
                                       allow write: if isTenantMember(resource.data.tenantId); }
    match /availabilityExceptions/{id}{allow read: if true;
                                       allow write: if isTenantMember(resource.data.tenantId); }
    match /bookings/{id} {
      allow read:   if isTenantMember(resource.data.tenantId)
                    || (isSignedIn() && resource.data.clientId == request.auth.uid);
      allow create: if sameTenant(request.resource.data.tenantId)
                    && request.resource.data.status == 'pending_payment';
      allow update: if isTenantMember(resource.data.tenantId);
      allow delete: if false;                              // soft-cancel only
    }
    match /packages/{id}             { allow read, write: if isTenantMember(resource.data.tenantId); }
    match /vouchers/{id}             { allow read: if isTenantMember(resource.data.tenantId);
                                       allow create: if sameTenant(request.resource.data.tenantId)
                                                       && request.resource.data.status == 'pending_payment';
                                       allow update, delete: if false; }    // functions-only
    match /clients/{id}              { allow read, write: if isTenantMember(resource.data.tenantId); }
    match /payments/{id}             { allow read: if isTenantMember(resource.data.tenantId);
                                       allow write: if false; }             // functions-only
    match /roles/{uid}               { allow read: if isSignedIn() && request.auth.uid == uid;
                                       allow write: if isSuperAdmin(); }
  }
}
```

---

## Roadmap (4 fazy)

| Faza | Czas | Kluczowe deliverables |
|---|---|---|
| **Phase 1 MVP** | 3 tyg | Single tenant Milosz, booking 1-on-1 + group, pakiety, **vouchery prezentowe**, Stripe Connect, Google Calendar 2-way, email confirm + reminders 24h/2h, dashboard trenera, public landing z partner club MMA Krosno |
| **Phase 2 Features** | 4-6 tyg | No-show preauth + auto-capture, WhatsApp Business reminders, waitlist + slot packing v1, substitute trainer flow, PDF invoice, refund automation, soft cancel UX |
| **Phase 3 SaaS launch** | 3-4 tyg | Landing `bookingapp.pl` (decyzja brandu), self-service tenant signup wizard, onboarding Pauliny + Radka (migracja danych), super_admin dashboard (MRR, tenants, alerts), i18n PL/EN |
| **Phase 4 Beauty vertical** | 4-6 tyg | Vertical templates (barber/fryzjer/kosmetyczka), multi-staff per tenant (salon z 3 fryzjerami), vertical-specific fields (kolor włosów, alergie), AI slot packing v2 |

**Total ETA:** 14-19 tygodni (~4-5 miesięcy) do pełnego SaaSa z 3 trenerami; Phase 4 dodatkowy kwartał.

---

## Step 0 — Setup repo lokalnie (przed Tydzień 1)

```bash
cd /c/Users/mikep
git clone https://github.com/mike88pas/bookingapp.git
cd bookingapp
# init npm workspaces, gitignore, README, podstawowa struktura
```

Po tym chef otwiera `c:\Users\mikep\bookingapp\` w nowej instancji VS Code i kontynuuje pracę tam (osobny CLAUDE.md per projekt).

---

## Verification (jak testujemy MVP end-to-end)

1. **Lokalnie (dev project + Stripe test mode):**
   - `npm run dev` (Vite) + `firebase emulators:start` (functions, firestore, auth)
   - Stripe CLI: `stripe listen --forward-to localhost:5001/.../stripeWebhook`
2. **Smoke test single booking flow:**
   - Otwórz `localhost:5173/b/milosz-mma`, wybierz slot, wypełnij formularz, zapłać kartą testową `4242 4242 4242 4242`
   - Sprawdź: booking w Firestore = `confirmed`, payment doc utworzony, Google Calendar event istnieje (na test koncie Milosza), email confirmation w skrzynce
3. **Pakiety:**
   - Kup pakiet 10x → `package{usedSessions:0}` w Firestore
   - Bookuj kolejny trening → `paymentMethod:'package'`, `usedSessions:1`, brak Stripe Checkout
4. **Vouchery:**
   - Kup voucher dla `recipient@test.com` → 2 emaile (buyer + recipient), `voucher{code:"MMA-X7K2", status:active}`
   - Otwórz `/v/MMA-X7K2`, wybierz slot, zarezerwuj → `voucher.status:redeemed`, booking utworzony bez Stripe
5. **Email reminders:**
   - Stwórz booking na `now + 24h05min`, uruchom `emailReminderDispatch` ręcznie → email 24h wysłany, `reminder24hSentAt` set
6. **Dashboard:**
   - Zaloguj jako Milosz, sprawdź TodaySchedule, edycję Availability, oznaczenie booking jako `completed`/`no_show`, CRUD service
7. **Production deploy:**
   - `firebase deploy --project bookingapp-prod`
   - Real test: kup voucher za 1 PLN test usługa, sprawdź Stripe dashboard (transfer do Connect account, application fee 15%)

---

## Open questions (do potwierdzenia po MVP, nie blokują startu)

1. **Stripe Connect:** Express (fast KYC, my host UI) — POTWIERDZONE jako default. Czy Milosz ma już konto Stripe? Onboarding ~15 min.
2. **Google Workspace dla Milosza:** czy używamy jego osobistego Gmaila do calendar sync, czy zakładamy `milosz@bookingapp.pl`?
3. **Email sender:** SendGrid free tier (100/dzień) vs Resend (100/dzień free, prostszy) — rekomendacja Resend.
4. **Voucher code format:** `MMA-XXXX` (4 znaki) czy `XXXXXXXX` (8 znaków)? Rekomendacja: 8 znaków base32 (~1.1T kombinacji, brak collision).
5. **Voucher expiry:** 12 mies. default — OK?
6. **Package expiry:** 60 dni default + rollover 3 sesji — OK?
7. **Cancellation policy:** 24h pełny refund, <24h 0% — OK jako default per tenant?
8. **Faktury VAT:** Milosz wystawia ręcznie czy integrujemy Fakturownia API w Phase 2?
9. **Domena docelowa SaaSa:** `bookingapp.pl` vs brand reveal w Phase 3 — decyzja po walidacji.
10. **MMA Krosno klub:** mają już stronę/logo do podlinkowania? Jakie info wyświetlamy w PartnerClubCard?

---

## Critical files (referencja)

- `c:\Users\mikep\fundacjalovevibe\fundacjalovevibe-be\functions\src\triggers\onBookingChange.ts` — wzorzec event-driven booking pipeline
- `c:\Users\mikep\fundacjalovevibe\fundacjalovevibe-be\functions\src\calendar\events.ts` — Google Calendar API integration
- `c:\Users\mikep\fundacjalovevibe\fundacjalovevibe-be\src\components\AvailabilityManager.tsx` — UI dostępności
- `c:\Users\mikep\fundacjalovevibe\fundacjalovevibe-be\src\lib\types.ts` — model danych do zaadaptowania
- `c:\Users\mikep\kettleforce\src\components\booking\WeeklyCalendar.tsx` — kalendarz tygodniowy UI
- `c:\Users\mikep\kettleforce\src\lib\types.ts` — Trainer interface
