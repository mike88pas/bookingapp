import { setGlobalOptions } from 'firebase-functions/v2';
import { defineSecret, defineString } from 'firebase-functions/params';

export const REGION = 'europe-central2';
export const APP_NAME = 'bookingapp';
export const DEFAULT_CURRENCY = 'PLN';
export const PLATFORM_FEE_PCT = 15;

setGlobalOptions({
  region: REGION,
  memory: '256MiB',
  maxInstances: 10,
});

// Secrets (set via: firebase functions:secrets:set KEY)
export const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY');
export const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET');
export const RESEND_API_KEY = defineSecret('RESEND_API_KEY');
export const GOOGLE_CLIENT_ID = defineSecret('GOOGLE_CLIENT_ID');
export const GOOGLE_CLIENT_SECRET = defineSecret('GOOGLE_CLIENT_SECRET');

// Config params (set via: firebase functions:config:set)
export const APP_URL = defineString('APP_URL', {
  default: 'https://bookingapp-dev.web.app',
});

// Google Calendar OAuth
export const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email',
];
