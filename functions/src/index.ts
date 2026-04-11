import './config';
import { initializeApp } from 'firebase-admin/app';

initializeApp();

// HTTP callables (Tydzien 2/3)
// export { createCheckoutSession } from './http/createCheckoutSession';
// export { createVoucherCheckout } from './http/createVoucherCheckout';
// export { redeemVoucher } from './http/redeemVoucher';
// export { stripeWebhook } from './http/stripeWebhook';
// export { googleOAuthCallback } from './http/googleOAuth';

// Firestore triggers
// export { onBookingChange } from './triggers/onBookingChange';
// export { onPaymentChange } from './triggers/onPaymentChange';
// export { onVoucherCreate } from './triggers/onVoucherCreate';

// Scheduled
// export { emailReminderDispatch } from './scheduled/emailReminderDispatch';
// export { packageExpiryCheck } from './scheduled/packageExpiryCheck';

export const healthCheck = () => ({ ok: true, version: '0.0.1' });
