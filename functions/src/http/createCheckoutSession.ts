import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { REGION, STRIPE_SECRET_KEY, APP_URL, PLATFORM_FEE_PCT } from '../config';
import { getStripe } from '../lib/stripe';

const db = admin.firestore();

type CheckoutMode = 'booking' | 'package';

interface CreateCheckoutInput {
  bookingId?: string;
  packageId?: string;
  mode: CheckoutMode;
}

export const createCheckoutSession = onCall(
  {
    region: REGION,
    secrets: [STRIPE_SECRET_KEY],
  },
  async (request) => {
    const { bookingId, packageId, mode } = request.data as CreateCheckoutInput;

    if (mode === 'booking' && !bookingId) {
      throw new HttpsError('invalid-argument', 'bookingId required for booking mode');
    }
    if (mode === 'package' && !packageId) {
      throw new HttpsError('invalid-argument', 'packageId required for package mode');
    }

    const stripe = getStripe();

    if (mode === 'booking') {
      return handleBookingCheckout(stripe, bookingId!);
    }
    return handlePackageCheckout(stripe, packageId!);
  }
);

async function handleBookingCheckout(stripe: ReturnType<typeof getStripe>, bookingId: string) {
  const bookingRef = db.collection('bookings').doc(bookingId);
  const bookingSnap = await bookingRef.get();
  if (!bookingSnap.exists) {
    throw new HttpsError('not-found', 'Booking not found');
  }
  const booking = bookingSnap.data()!;

  if (booking.status !== 'pending_payment') {
    throw new HttpsError('failed-precondition', 'Booking is not in pending_payment status');
  }

  // Get tenant for Stripe Connect account
  const tenantSnap = await db.collection('tenants').doc(booking.tenantId).get();
  if (!tenantSnap.exists) {
    throw new HttpsError('not-found', 'Tenant not found');
  }
  const tenant = tenantSnap.data()!;

  if (!tenant.stripeAccountId) {
    throw new HttpsError('failed-precondition', 'Trainer has not connected Stripe yet');
  }

  const priceGrosze = booking.servicePrice;
  const feePct = tenant.platformFeePct ?? PLATFORM_FEE_PCT;
  const applicationFee = Math.round(priceGrosze * feePct / 100);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card', 'p24', 'blik'],
    line_items: [
      {
        price_data: {
          currency: (tenant.currency || 'PLN').toLowerCase(),
          product_data: {
            name: booking.serviceName,
            description: `Trening z ${booking.trainerName}`,
          },
          unit_amount: priceGrosze,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: applicationFee,
      transfer_data: {
        destination: tenant.stripeAccountId,
      },
      metadata: {
        bookingId,
        tenantId: booking.tenantId,
        mode: 'booking',
      },
    },
    customer_email: booking.clientEmail,
    success_url: `${APP_URL.value()}/b/${tenant.slug}/confirmation/${bookingId}?status=success`,
    cancel_url: `${APP_URL.value()}/b/${tenant.slug}?status=cancelled`,
    metadata: {
      bookingId,
      tenantId: booking.tenantId,
      mode: 'booking',
    },
  });

  return { sessionUrl: session.url };
}

async function handlePackageCheckout(stripe: ReturnType<typeof getStripe>, packageId: string) {
  const pkgRef = db.collection('packages').doc(packageId);
  const pkgSnap = await pkgRef.get();
  if (!pkgSnap.exists) {
    throw new HttpsError('not-found', 'Package not found');
  }
  const pkg = pkgSnap.data()!;

  const tenantSnap = await db.collection('tenants').doc(pkg.tenantId).get();
  if (!tenantSnap.exists) {
    throw new HttpsError('not-found', 'Tenant not found');
  }
  const tenant = tenantSnap.data()!;

  if (!tenant.stripeAccountId) {
    throw new HttpsError('failed-precondition', 'Trainer has not connected Stripe yet');
  }

  const serviceSnap = await db.collection('services').doc(pkg.serviceId).get();
  const serviceName = serviceSnap.exists ? serviceSnap.data()!.name : 'Pakiet treningow';

  const feePct = tenant.platformFeePct ?? PLATFORM_FEE_PCT;
  const applicationFee = Math.round(pkg.price * feePct / 100);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card', 'p24', 'blik'],
    line_items: [
      {
        price_data: {
          currency: (tenant.currency || 'PLN').toLowerCase(),
          product_data: {
            name: `Pakiet ${pkg.totalSessions}x — ${serviceName}`,
          },
          unit_amount: pkg.price,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: applicationFee,
      transfer_data: {
        destination: tenant.stripeAccountId,
      },
      metadata: {
        packageId,
        tenantId: pkg.tenantId,
        mode: 'package',
      },
    },
    success_url: `${APP_URL.value()}/b/${tenant.slug}?package=success`,
    cancel_url: `${APP_URL.value()}/b/${tenant.slug}?package=cancelled`,
    metadata: {
      packageId,
      tenantId: pkg.tenantId,
      mode: 'package',
    },
  });

  return { sessionUrl: session.url };
}
