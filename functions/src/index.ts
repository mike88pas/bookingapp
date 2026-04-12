import './config';
import { initializeApp } from 'firebase-admin/app';

initializeApp();

// HTTP callables
export { createCheckoutSession } from './http/createCheckoutSession';
export { stripeWebhook } from './http/stripeWebhook';

// Google Calendar OAuth
export { googleCalendarAuthStart, googleCalendarCallback } from './calendar/auth';

// Firestore triggers
export { onBookingChange } from './triggers/onBookingChange';
