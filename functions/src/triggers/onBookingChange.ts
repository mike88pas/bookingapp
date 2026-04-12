import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import { REGION, RESEND_API_KEY } from '../config';
import { sendEmail } from '../email/sendEmail';
import * as templates from '../email/templates';
import { createCalendarEvent, deleteCalendarEvent } from '../calendar/events';

const db = admin.firestore();

function formatDate(ts: admin.firestore.Timestamp): string {
  return ts.toDate().toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(ts: admin.firestore.Timestamp): string {
  return ts.toDate().toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Warsaw',
  });
}

async function getTenantSlug(tenantId: string): Promise<string> {
  const snap = await db.collection('tenants').doc(tenantId).get();
  return snap.exists ? snap.data()!.slug || tenantId : tenantId;
}

async function getTrainerEmail(trainerId: string): Promise<string | null> {
  const snap = await db.collection('trainers').doc(trainerId).get();
  if (!snap.exists) return null;
  return snap.data()!.email || null;
}

export const onBookingChange = onDocumentWritten(
  {
    document: 'bookings/{bookingId}',
    region: REGION,
    secrets: [RESEND_API_KEY],
  },
  async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();

    // Deleted — ignore
    if (!after) return;

    const bookingId = event.params?.bookingId;
    if (!bookingId) return;

    // ── Status changed to CONFIRMED ─────────────────
    if (
      (!before || before.status !== 'confirmed') &&
      after.status === 'confirmed'
    ) {
      const tenantSlug = await getTenantSlug(after.tenantId);
      const dateStr = formatDate(after.startAt);
      const timeStr = formatTime(after.startAt);

      // Google Calendar event (non-blocking)
      if (!after.googleCalendarEventId) {
        try {
          await createCalendarEvent(after.trainerId, bookingId, {
            clientName: after.clientName,
            clientEmail: after.clientEmail,
            trainerName: after.trainerName,
            service: after.serviceName,
            startAt: after.startAt,
            durationMin: after.durationMin,
            locationType: after.locationType || 'onsite',
            notes: after.notes,
          });
        } catch (err) {
          console.error('Calendar event creation failed (non-blocking):', err);
        }
      }

      const emailData = {
        clientName: after.clientName,
        clientEmail: after.clientEmail,
        trainerName: after.trainerName,
        service: after.serviceName,
        date: dateStr,
        time: timeStr,
        priceGrosze: after.servicePrice,
        tenantSlug,
      };

      // Email to client
      const clientEmail = templates.bookingConfirmedClient(emailData);
      await sendEmail({
        to: after.clientEmail,
        subject: clientEmail.subject,
        html: clientEmail.html,
      });

      // Email to trainer
      const trainerEmailAddr = await getTrainerEmail(after.trainerId);
      if (trainerEmailAddr) {
        const trainerEmail = templates.bookingConfirmedTrainer({
          ...emailData,
          trainerEmail: trainerEmailAddr,
        });
        await sendEmail({
          to: trainerEmailAddr,
          subject: trainerEmail.subject,
          html: trainerEmail.html,
        });
      }

      return;
    }

    // ── Status changed to CANCELLED ─────────────────
    const cancelledStatuses = ['cancelled_by_client', 'cancelled_by_trainer'];
    const wasCancelled =
      before && !cancelledStatuses.includes(before.status) && cancelledStatuses.includes(after.status);

    if (wasCancelled) {
      // Delete Calendar event
      if (after.googleCalendarEventId) {
        try {
          await deleteCalendarEvent(after.trainerId, after.googleCalendarEventId);
        } catch (err) {
          console.error('Calendar event deletion failed (non-blocking):', err);
        }
      }

      const tenantSlug = await getTenantSlug(after.tenantId);
      const dateStr = formatDate(after.startAt);
      const timeStr = formatTime(after.startAt);
      const baseData = {
        clientName: after.clientName,
        trainerName: after.trainerName,
        service: after.serviceName,
        date: dateStr,
        time: timeStr,
      };

      // Email to client
      const clientEmail = templates.bookingCancelledClient({ ...baseData, tenantSlug });
      await sendEmail({
        to: after.clientEmail,
        subject: clientEmail.subject,
        html: clientEmail.html,
      });

      // Email to trainer (if cancelled by client)
      if (after.status === 'cancelled_by_client') {
        const trainerEmailAddr = await getTrainerEmail(after.trainerId);
        if (trainerEmailAddr) {
          const trainerEmail = templates.bookingCancelledTrainer(baseData);
          await sendEmail({
            to: trainerEmailAddr,
            subject: trainerEmail.subject,
            html: trainerEmail.html,
          });
        }
      }
    }
  }
);
