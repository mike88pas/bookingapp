import type { Timestamp } from 'firebase/firestore';

// ============================================================
// Enums / unions
// ============================================================

export type Vertical = 'fitness' | 'beauty' | 'wellness';

export type ServiceCategory =
  | 'mma'
  | 'fitness'
  | 'yoga'
  | 'physio'
  | 'beauty'
  | 'other';

export type UserRole = 'client' | 'trainer' | 'tenant_admin' | 'super_admin';

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'cancelled_by_client'
  | 'cancelled_by_trainer'
  | 'no_show'
  | 'completed';

export type PaymentMethod =
  | 'stripe_card'
  | 'blik'
  | 'p24'
  | 'cash'
  | 'package'
  | 'voucher';

export type PaymentStatus =
  | 'none'
  | 'preauth'
  | 'captured'
  | 'refunded'
  | 'failed';

export type VoucherStatus =
  | 'pending_payment'
  | 'active'
  | 'redeemed'
  | 'expired'
  | 'refunded';

export type PackageStatus = 'active' | 'expired' | 'used_up' | 'refunded';

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type LocationType = 'onsite' | 'online' | 'client_location';

export type TenantPlan = 'free' | 'starter' | 'pro';

export type Currency = 'PLN' | 'EUR';

export type VoucherOccasion =
  | 'birthday'
  | 'christmas'
  | 'valentines'
  | 'other';

export interface TimeSlot {
  start: string; // ISO "HH:mm"
  end: string; // ISO "HH:mm"
}

export interface PartnerClub {
  name: string;
  address: string;
  url?: string;
  logoUrl?: string;
}

// ============================================================
// Tenant
// ============================================================

export interface Tenant {
  id: string;
  slug: string; // "milosz-mma"
  displayName: string;
  vertical: Vertical;
  ownerUid: string;
  stripeAccountId?: string;
  stripeOnboardingComplete: boolean;
  platformFeePct: number; // 15 default
  currency: Currency;
  timezone: string; // "Europe/Warsaw"
  locale: 'pl' | 'en';
  brandColor?: string;
  logoUrl?: string;
  coverUrl?: string;
  partnerClub?: PartnerClub;
  plan: TenantPlan;
  createdAt: Timestamp;
  active: boolean;
}

// ============================================================
// Trainer
// ============================================================

export interface TrainerProfile {
  id: string;
  tenantId: string;
  uid: string;
  name: string;
  role: string; // np. "Trener MMA"
  category: ServiceCategory;
  specializations: string[];
  achievements: string[]; // mistrzostwa, tytuly
  photoUrl?: string;
  bio?: string;
  phone: string;
  email: string;
  googleCalendarConnected: boolean;
  googleRefreshToken?: string; // encrypted, functions-only
  googleCalendarId?: string;
  active: boolean;
}

// ============================================================
// Service
// ============================================================

export interface Service {
  id: string;
  tenantId: string;
  trainerId: string;
  name: string;
  category: ServiceCategory;
  durationMin: number;
  price: number; // grosze
  currency: Currency;
  description?: string;
  maxParticipants: number; // 1 = 1-on-1, >1 = group
  giftEligible: boolean;
  requiresPreauth: boolean; // Phase 2
  noShowFee?: number;
  active: boolean;
}

// ============================================================
// Availability
// ============================================================

export interface Availability {
  id: string; // `${trainerId}_${dow}`
  tenantId: string;
  trainerId: string;
  dayOfWeek: DayOfWeek;
  slots: TimeSlot[];
  active: boolean;
}

export interface AvailabilityException {
  id: string;
  tenantId: string;
  trainerId: string;
  date: string; // "2026-04-20"
  type: 'unavailable' | 'custom';
  customSlots?: TimeSlot[];
  reason?: string;
}

// ============================================================
// Booking
// ============================================================

export interface BookingParticipant {
  clientId: string;
  name: string;
}

export interface Booking {
  id: string;
  tenantId: string;
  trainerId: string;
  trainerName: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  status: BookingStatus;
  startAt: Timestamp;
  endAt: Timestamp;
  durationMin: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  packageId?: string;
  voucherId?: string;
  stripePaymentIntentId?: string;
  googleCalendarEventId?: string;
  locationType: LocationType;
  locationAddress?: string;
  notes?: string;
  trainerNotes?: string;
  reminder24hSentAt?: Timestamp;
  reminder2hSentAt?: Timestamp;
  participants?: BookingParticipant[];
  cancelledAt?: Timestamp;
  cancellationReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================
// Package
// ============================================================

export interface Package {
  id: string;
  tenantId: string;
  clientId: string;
  trainerId: string;
  serviceId: string;
  totalSessions: number;
  usedSessions: number;
  rolloverAllowed: number;
  purchasedAt: Timestamp;
  expiresAt: Timestamp;
  price: number;
  paymentId?: string;
  status: PackageStatus;
}

// ============================================================
// Voucher
// ============================================================

export interface Voucher {
  id: string;
  tenantId: string;
  code: string; // "MMAX7K2A9"
  serviceId?: string;
  amount?: number; // alternatywnie: voucher kwotowy
  buyerName: string;
  buyerEmail: string;
  recipientName: string;
  recipientEmail?: string;
  message?: string;
  occasion?: VoucherOccasion;
  status: VoucherStatus;
  paymentId?: string;
  stripePaymentIntentId?: string;
  redeemedBookingId?: string;
  redeemedAt?: Timestamp;
  expiresAt: Timestamp; // np. +12 miesiecy
  createdAt: Timestamp;
}

// ============================================================
// Client (CRM record per tenant)
// ============================================================

export interface Client {
  id: string;
  tenantId: string;
  uid?: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  completedBookings: number;
  noShowCount: number;
  tags: string[];
  notes?: string;
  createdAt: Timestamp;
}

// ============================================================
// Payment
// ============================================================

export interface Payment {
  id: string;
  tenantId: string;
  bookingId?: string;
  packageId?: string;
  voucherId?: string;
  clientId?: string;
  buyerEmail?: string;
  amount: number;
  platformFee: number;
  trainerAmount: number;
  currency: Currency;
  method: PaymentMethod;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeTransferId?: string;
  refundedAmount?: number;
  createdAt: Timestamp;
}

// ============================================================
// User role document
// ============================================================

export interface UserRoleDoc {
  uid: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  trainerId?: string;
  createdAt: Timestamp;
}

// ============================================================
// Helpers / constants
// ============================================================

export const DEFAULT_PLATFORM_FEE_PCT = 15;
export const DEFAULT_PACKAGE_EXPIRY_DAYS = 60;
export const DEFAULT_PACKAGE_ROLLOVER = 3;
export const DEFAULT_VOUCHER_EXPIRY_MONTHS = 12;
export const DEFAULT_TIMEZONE = 'Europe/Warsaw';
export const DEFAULT_CURRENCY: Currency = 'PLN';
export const DEFAULT_LOCALE = 'pl';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
];
