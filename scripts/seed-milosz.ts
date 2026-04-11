/**
 * Seed skrypt: tworzy tenant "milosz-mma", trainer "milosz", 4 uslugi.
 * Uruchom przez emulator:
 *   npm run emulators
 *   npx tsx scripts/seed-milosz.ts
 *
 * Wymaga FIRESTORE_EMULATOR_HOST=127.0.0.1:8080.
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import type {
  Tenant,
  TrainerProfile,
  Service,
} from '../packages/shared-types/src/index';

const USE_EMULATOR = process.env.FIRESTORE_EMULATOR_HOST != null;

if (USE_EMULATOR) {
  initializeApp({ projectId: 'bookingapp-dev' });
} else {
  initializeApp({
    credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS ?? ''),
  });
}

const db = getFirestore();
const now = Timestamp.now();

async function seed() {
  const tenantId = 'milosz-mma';
  const trainerId = 'milosz';

  const tenant: Tenant = {
    id: tenantId,
    slug: 'milosz-mma',
    displayName: 'Milosz Kornasiewicz',
    vertical: 'fitness',
    ownerUid: 'REPLACE_AFTER_AUTH',
    stripeOnboardingComplete: false,
    platformFeePct: 15,
    currency: 'PLN',
    timezone: 'Europe/Warsaw',
    locale: 'pl',
    brandColor: '#e63946',
    partnerClub: {
      name: 'MMA Krosno',
      address: 'Krosno, Polska',
      url: 'https://mma-krosno.pl',
    },
    plan: 'free',
    createdAt: now,
    active: true,
  };

  const trainer: TrainerProfile = {
    id: trainerId,
    tenantId,
    uid: 'REPLACE_AFTER_AUTH',
    name: 'Milosz Kornasiewicz',
    role: 'Trener MMA / zawodnik',
    category: 'mma',
    specializations: ['MMA', 'Sparring', 'Boks', 'Grappling'],
    achievements: [
      'Mistrz Polski juniorow MMA',
      'Zawodnik federacji KSW',
      'Trener z certyfikatem EBI',
    ],
    bio: 'Zawodowy zawodnik MMA i trener. Prowadze treningi 1-on-1 oraz grupowe w klubie MMA Krosno.',
    phone: '+48 600 000 000',
    email: 'milosz@example.com',
    googleCalendarConnected: false,
    active: true,
  };

  const services: Service[] = [
    {
      id: 'svc-1on1',
      tenantId,
      trainerId,
      name: 'Trening indywidualny 1-on-1',
      category: 'mma',
      durationMin: 60,
      price: 18000, // 180 PLN
      currency: 'PLN',
      description: 'Indywidualny trening MMA dopasowany do Twojego poziomu.',
      maxParticipants: 1,
      giftEligible: true,
      requiresPreauth: false,
      active: true,
    },
    {
      id: 'svc-group-mma',
      tenantId,
      trainerId,
      name: 'Grupowy trening MMA',
      category: 'mma',
      durationMin: 90,
      price: 7000, // 70 PLN
      currency: 'PLN',
      description: 'Grupowe zajecia MMA w klubie MMA Krosno.',
      maxParticipants: 12,
      giftEligible: true,
      requiresPreauth: false,
      active: true,
    },
    {
      id: 'svc-sparring',
      tenantId,
      trainerId,
      name: 'Sparring kontrolowany',
      category: 'mma',
      durationMin: 60,
      price: 12000,
      currency: 'PLN',
      description: 'Sparring z kontrolowanym kontaktem pod okiem trenera.',
      maxParticipants: 1,
      giftEligible: false,
      requiresPreauth: true,
      noShowFee: 5000,
      active: true,
    },
    {
      id: 'svc-boks',
      tenantId,
      trainerId,
      name: 'Trening boksu 1-on-1',
      category: 'mma',
      durationMin: 60,
      price: 15000,
      currency: 'PLN',
      maxParticipants: 1,
      giftEligible: true,
      requiresPreauth: false,
      active: true,
    },
  ];

  await db.collection('tenants').doc(tenantId).set(tenant);
  await db.collection('trainers').doc(trainerId).set(trainer);
  for (const s of services) {
    await db.collection('services').doc(s.id).set(s);
  }

  console.log('Seed OK: tenant + trainer + 4 services');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
