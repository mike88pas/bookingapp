import { google } from 'googleapis';
import * as admin from 'firebase-admin';
import { getTrainerOAuth2Client } from './auth';
import { APP_NAME } from '../config';

const db = admin.firestore();

interface BookingCalendarData {
  clientName: string;
  clientEmail: string;
  trainerName: string;
  service: string;
  startAt: admin.firestore.Timestamp;
  durationMin: number;
  locationType: string;
  notes?: string;
}

/**
 * Create Google Calendar event for a confirmed booking.
 * Returns { calendarEventId } or null if trainer has no calendar.
 */
export async function createCalendarEvent(
  trainerId: string,
  bookingId: string,
  booking: BookingCalendarData
): Promise<{ calendarEventId: string } | null> {
  const oauth2Client = await getTrainerOAuth2Client(trainerId);
  if (!oauth2Client) return null;

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const startDate = booking.startAt.toDate();
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + booking.durationMin);

  try {
    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: `${APP_NAME} — ${booking.service}`,
        description: [
          `Klient: ${booking.clientName} (${booking.clientEmail})`,
          `Usluga: ${booking.service}`,
          `Typ: ${booking.locationType === 'online' ? 'Online' : 'Na miejscu'}`,
          booking.notes ? `\nNotatki klienta: ${booking.notes}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'Europe/Warsaw',
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'Europe/Warsaw',
        },
        attendees: [{ email: booking.clientEmail }],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 },
            { method: 'popup', minutes: 15 },
          ],
        },
      },
    });

    const calendarEventId = event.data.id || '';

    await db.collection('bookings').doc(bookingId).update({
      googleCalendarEventId: calendarEventId,
    });

    console.log(`Calendar event created for booking ${bookingId}: ${calendarEventId}`);
    return { calendarEventId };
  } catch (err) {
    console.error('Error creating calendar event:', err);
    return null;
  }
}

/**
 * Delete Google Calendar event when a booking is cancelled.
 */
export async function deleteCalendarEvent(
  trainerId: string,
  calendarEventId: string
): Promise<boolean> {
  const oauth2Client = await getTrainerOAuth2Client(trainerId);
  if (!oauth2Client) return false;

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: calendarEventId,
    });
    console.log(`Calendar event deleted: ${calendarEventId}`);
    return true;
  } catch (err) {
    console.error('Error deleting calendar event:', err);
    return false;
  }
}
