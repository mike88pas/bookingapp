import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import { REGION, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '../config';
import { getStripe } from '../lib/stripe';

const db = admin.firestore();

export const stripeWebhook = onRequest(
  {
    region: REGION,
    secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET],
    invoker: 'public',
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    const stripe = getStripe();
    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        STRIPE_WEBHOOK_SECRET.value()
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      res.status(400).send('Webhook signature verification failed');
      return;
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (err) {
      console.error(`Error processing webhook ${event.type}:`, err);
      res.status(500).send('Webhook processing failed');
      return;
    }

    res.status(200).json({ received: true });
  }
);

async function handlePaymentSucceeded(pi: Stripe.PaymentIntent) {
  const { bookingId, packageId, tenantId, mode } = pi.metadata;

  if (mode === 'booking' && bookingId) {
    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingSnap = await bookingRef.get();
    if (!bookingSnap.exists) {
      console.error(`Booking ${bookingId} not found for PI ${pi.id}`);
      return;
    }

    const now = admin.firestore.FieldValue.serverTimestamp();

    // Update booking status
    await bookingRef.update({
      status: 'confirmed',
      paymentStatus: 'captured',
      stripePaymentIntentId: pi.id,
      updatedAt: now,
    });

    // Create payment doc
    const booking = bookingSnap.data()!;
    const feeAmount = typeof pi.application_fee_amount === 'number'
      ? pi.application_fee_amount
      : Math.round(booking.servicePrice * 0.15);

    await db.collection('payments').add({
      tenantId: tenantId || booking.tenantId,
      bookingId,
      clientId: booking.clientId,
      amount: booking.servicePrice,
      platformFee: feeAmount,
      trainerAmount: booking.servicePrice - feeAmount,
      currency: 'PLN',
      method: paymentMethodFromPI(pi),
      status: 'captured',
      stripePaymentIntentId: pi.id,
      stripeChargeId: pi.latest_charge as string || '',
      createdAt: now,
    });

    console.log(`Booking ${bookingId} confirmed, payment created`);
  }

  if (mode === 'package' && packageId) {
    const pkgRef = db.collection('packages').doc(packageId);
    const pkgSnap = await pkgRef.get();
    if (!pkgSnap.exists) {
      console.error(`Package ${packageId} not found for PI ${pi.id}`);
      return;
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const pkg = pkgSnap.data()!;

    await pkgRef.update({
      status: 'active',
      paymentId: pi.id,
    });

    const feeAmount = typeof pi.application_fee_amount === 'number'
      ? pi.application_fee_amount
      : Math.round(pkg.price * 0.15);

    await db.collection('payments').add({
      tenantId: tenantId || pkg.tenantId,
      packageId,
      clientId: pkg.clientId,
      amount: pkg.price,
      platformFee: feeAmount,
      trainerAmount: pkg.price - feeAmount,
      currency: 'PLN',
      method: paymentMethodFromPI(pi),
      status: 'captured',
      stripePaymentIntentId: pi.id,
      stripeChargeId: pi.latest_charge as string || '',
      createdAt: now,
    });

    console.log(`Package ${packageId} activated, payment created`);
  }
}

async function handlePaymentFailed(pi: Stripe.PaymentIntent) {
  const { bookingId, mode } = pi.metadata;

  if (mode === 'booking' && bookingId) {
    const bookingRef = db.collection('bookings').doc(bookingId);
    await bookingRef.update({
      paymentStatus: 'failed',
      stripePaymentIntentId: pi.id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`Booking ${bookingId} payment failed`);
  }
}

function paymentMethodFromPI(pi: Stripe.PaymentIntent): string {
  const pmTypes = pi.payment_method_types || [];
  if (pmTypes.includes('blik')) return 'blik';
  if (pmTypes.includes('p24')) return 'p24';
  return 'stripe_card';
}
