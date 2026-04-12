import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import type { Booking } from '@bookingapp/shared-types';
import { db, functions } from './firebase';
import type { ComputedSlot } from './slots';

export interface CreateBookingInput {
  tenantId: string;
  trainerId: string;
  trainerName: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  durationMin: number;
  slot: ComputedSlot;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
}

/**
 * Tworzy booking{pending_payment} w Firestore, potem wywoluje
 * createCheckoutSession i zwraca sessionUrl do redirectu.
 */
export async function createBookingAndCheckout(
  input: CreateBookingInput
): Promise<string> {
  const startAt = Timestamp.fromDate(new Date(input.slot.startAtISO));
  const endDate = new Date(input.slot.startAtISO);
  endDate.setMinutes(endDate.getMinutes() + input.durationMin);
  const endAt = Timestamp.fromDate(endDate);
  const now = Timestamp.now();

  const bookingData: Omit<Booking, 'id'> = {
    tenantId: input.tenantId,
    trainerId: input.trainerId,
    trainerName: input.trainerName,
    clientId: '', // guest checkout — no auth required
    clientName: input.clientName,
    clientEmail: input.clientEmail,
    clientPhone: input.clientPhone,
    serviceId: input.serviceId,
    serviceName: input.serviceName,
    servicePrice: input.servicePrice,
    status: 'pending_payment',
    startAt,
    endAt,
    durationMin: input.durationMin,
    paymentMethod: 'stripe_card',
    paymentStatus: 'none',
    locationType: 'onsite',
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, 'bookings'), bookingData);

  const callable = httpsCallable<
    { bookingId: string; mode: string },
    { sessionUrl: string }
  >(functions, 'createCheckoutSession');

  const result = await callable({ bookingId: docRef.id, mode: 'booking' });

  if (!result.data.sessionUrl) {
    throw new Error('No checkout session URL returned');
  }

  return result.data.sessionUrl;
}
