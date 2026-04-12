import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '../config';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(STRIPE_SECRET_KEY.value(), {
      apiVersion: '2025-02-24.acacia',
    });
  }
  return stripeClient;
}
