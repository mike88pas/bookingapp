# bookingapp — Stan projektu

**Ostatnia aktualizacja:** 2026-04-12
**Faza:** Phase 1 MVP — koniec **Tydzien 2** + **CAGE redesign**

## Live URLs
- **Dev:** https://bookingapp-dev.web.app/b/milosz-mma (HTTP 200, z danymi)
- **Prod:** https://bookingapp-prod.web.app (hosting only, brak danych)
- **GitHub:** https://github.com/mike88pas/bookingapp

## Co dziala — Tydzien 1 (Foundation)
- ✅ npm workspaces (`./`, `packages/shared-types/`, `functions/`)
- ✅ Vite 7 + React 19 + TS 5.9 + Tailwind v4 + RRv7
- ✅ Pelny data model w `packages/shared-types/src/index.ts`
- ✅ AuthContext + TenantContext + guards (role-based)
- ✅ Hooki: useAuth, useTenant, useAvailability, useBookings
- ✅ Firebase: firestore.rules (multi-tenant), indexes, region europe-central2
- ✅ Seed Milosza uruchomiony na bookingapp-dev (tenant + trainer + 4 uslugi)

## Co dziala — Tydzien 2 (Booking + Payments + Calendar)
- ✅ `createCheckoutSession` — Stripe Connect, 15% fee, card/p24/blik, mode booking+package
- ✅ `stripeWebhook` — payment_intent.succeeded/failed → booking confirmed + payment doc
- ✅ `onBookingChange` trigger — confirmed → Google Calendar event + email PL, cancelled → delete + email
- ✅ Google Calendar OAuth — googleCalendarAuthStart + googleCalendarCallback (port fundacjalovevibe-be)
- ✅ Email sender Resend + PL templates (confirmed, cancelled, reminder)
- ✅ BookingForm submit → createBookingAndCheckout → Stripe Checkout redirect
- ✅ ConfirmationPage — pobiera booking po ID, renderuje status
- ✅ PackagePicker — 3 tiers (5x/10x/20x) z rabatem + Stripe checkout

## Co dziala — CAGE Redesign (design + copy)
- ✅ **Design "CAGE"** — brutalny, geometryczny, premium dark, motyw oktagon/klatka
- ✅ Font Oswald (display) + Inter (body), Google Fonts
- ✅ **HeroSection** — full viewport, particle field (canvas 60 czasteczek), gradient orbs (Apple-style), animated gradient text, octagon decoration, scan line, trust bar, 2 CTA z smooth scroll
- ✅ **StatsBar** — 4 kolumny z CountUp animacja (rekord MMA, ranking PL, walk w klatce, lat na macie)
- ✅ **AboutSection** — split layout: bio w 1. osobie + FightRecord (7 walk, kolorowy border W/L, win rate bar)
- ✅ **ServicePicker** — stagger animation, GlowCard (cursor-following spotlight), glow-border na hover, shimmer badge "Popularne"
- ✅ **BookingSection** — 3-step progress bar (Trening > Termin > Dane), smooth auto-scroll miedzy krokami
- ✅ **WeeklyCalendar** — animated column entrance, brand-500 shadow na selected slot
- ✅ **BookingForm** — glassmorphism, border-l accent na slot summary, uppercase submit
- ✅ **PackagePicker** — 3 tier cards, srodkowa wyrosniona (scale-105, shimmer "NAJPOPULARNIEJSZY"), zlota korona na 20x
- ✅ **GiftVoucherCTA** — "Prezent, ktory zostaje w ciele", pulse glow, emotional copy
- ✅ **PartnerClubCard** — MMA Krosno, "Tu sie zaczela moja droga"
- ✅ **FooterSection** — social links, anchor scroll CTA
- ✅ **DiagonalDivider** — clip-path cięcia miedzy sekcjami (nie wave)
- ✅ **NoiseTexture** — SVG noise overlay na calej stronie
- ✅ **Copywriting PL** — world-class copy: "Trener, ktory wchodzi do klatki", bio w 1. osobie, emocjonalne CTA

## UI Primitives (src/components/ui/)
- AnimatedSection — viewport-triggered motion wrapper
- StaggerGrid — stagger container + item
- CountUp — animated number counter
- DiagonalDivider — CSS clip-path diagonal section divider
- NoiseTexture — SVG noise texture overlay
- BookingProgress — 3-step progress indicator
- ParticleField — canvas particle network (60 czasteczek + linie polaczen)
- GradientOrbs — Apple-style animated gradient orbs
- GlowCard — cursor-following glow spotlight

## Dane w Firestore (bookingapp-dev)
- `tenants/milosz-mma` — slug, displayName, partnerClub MMA Krosno, brandColor #e63946
- `trainers/milosz` — name, role, category mma, specjalizacje, achievements, bio
- `services/svc-1on1` — Trening indywidualny 1-on-1, 180 PLN, 60 min
- `services/svc-group-mma` — Grupowy trening MMA, 70 PLN, 90 min, max 12
- `services/svc-sparring` — Sparring kontrolowany, 120 PLN, 60 min
- `services/svc-boks` — Trening boksu 1-on-1, 150 PLN, 60 min

## Buildy
```
npx tsc -b                 ✅
npx vite build             ✅ (756 KB → 238 KB gzip)
cd functions && npx tsc    ✅
```

## Co trzeba zrobic recznie (blokery przed pelnym flow)
1. **Firebase Auth Email/Password** — wlaczyc w konsoli: https://console.firebase.google.com/project/bookingapp-dev/authentication/providers
2. **Blaze plan** na bookingapp-dev (wymagany do Functions deploy)
3. **Secrets** przed deploy functions:
   ```bash
   firebase functions:secrets:set STRIPE_SECRET_KEY --project bookingapp-dev
   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET --project bookingapp-dev
   firebase functions:secrets:set RESEND_API_KEY --project bookingapp-dev
   firebase functions:secrets:set GOOGLE_CLIENT_ID --project bookingapp-dev
   firebase functions:secrets:set GOOGLE_CLIENT_SECRET --project bookingapp-dev
   ```
4. **Deploy functions:** `firebase deploy --only functions --project bookingapp-dev`
5. **Stripe webhook URL:** dodac w Stripe Dashboard
6. **Stripe Connect:** wpisac `stripeAccountId` do `tenants/milosz-mma`

## Tydzien 3 — TODO (Vouchers + Dashboard + Reminders + Deploy)
- [ ] Vouchery (createVoucherCheckout, onVoucherCreate trigger, VoucherPurchaseForm, VoucherRedeemPage)
- [ ] Generator kodu: functions/src/lib/codeGen.ts (8-char base32)
- [ ] Trainer dashboard: TodaySchedule, CRUD services, AvailabilityManager hookup, lista klientow
- [ ] Email reminders cron: emailReminderDispatch.ts (co 15 min, 24h + 2h przed)
- [ ] packageExpiryCheck cron (codziennie)
- [ ] PWA: manifest + service worker + ikona
- [ ] Availability seeding (aktualnie brak slotow — trzeba dodac availability docs zeby kalendarz pokazywal terminy)
- [ ] Final deploy: bookingapp-dev.web.app + bookingapp-prod.web.app
