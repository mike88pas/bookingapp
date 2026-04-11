import type {
  Availability,
  AvailabilityException,
  Booking,
  DayOfWeek,
  Service,
} from '@bookingapp/shared-types';
import { DAYS_OF_WEEK } from '@bookingapp/shared-types';

export interface ComputedSlot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  available: boolean;
  startAtISO: string;
}

/**
 * Zwraca dzien tygodnia w formacie DayOfWeek ('mon'..'sun') z obiektu Date
 * bazujac na lokalnym dniu tygodnia (pon=0 w naszej konwencji).
 */
export function dowFromDate(d: Date): DayOfWeek {
  const js = d.getDay(); // 0=Sun..6=Sat
  const map: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return map[js];
}

function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export interface ComputeSlotsInput {
  from: Date;
  daysCount: number;
  service: Pick<Service, 'durationMin'>;
  weekly: Availability[];
  exceptions: AvailabilityException[];
  bookings: Booking[];
}

/**
 * Generuje sloty tygodnia na podstawie availability + service.durationMin,
 * usuwa sloty kolidujace z istniejacymi bookingami (status != cancelled*).
 */
export function computeSlots({
  from,
  daysCount,
  service,
  weekly,
  exceptions,
  bookings,
}: ComputeSlotsInput): ComputedSlot[] {
  const byDow = new Map<DayOfWeek, Availability>();
  for (const a of weekly) byDow.set(a.dayOfWeek, a);

  const bookedAt = new Set<string>();
  for (const b of bookings) {
    if (
      b.status === 'cancelled_by_client' ||
      b.status === 'cancelled_by_trainer'
    ) {
      continue;
    }
    const ts = b.startAt?.toDate?.() ?? new Date();
    bookedAt.add(ts.toISOString());
  }

  const result: ComputedSlot[] = [];
  for (let i = 0; i < daysCount; i++) {
    const day = new Date(from);
    day.setDate(day.getDate() + i);
    day.setHours(0, 0, 0, 0);

    const iso = toISODate(day);
    const dow = dowFromDate(day);

    const ex = exceptions.find((e) => e.date === iso);
    if (ex?.type === 'unavailable') continue;

    const avail = ex?.type === 'custom' && ex.customSlots
      ? { slots: ex.customSlots, active: true }
      : byDow.get(dow);
    if (!avail || !avail.active) continue;
    if (!DAYS_OF_WEEK.includes(dow)) continue;

    for (const slot of avail.slots) {
      const [sh, sm] = slot.start.split(':').map(Number);
      const [eh, em] = slot.end.split(':').map(Number);
      const blockStartMin = sh * 60 + sm;
      const blockEndMin = eh * 60 + em;
      for (
        let t = blockStartMin;
        t + service.durationMin <= blockEndMin;
        t += service.durationMin
      ) {
        const startHH = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
        const endHH = addMinutes(startHH, service.durationMin);
        const start = new Date(day);
        start.setHours(Math.floor(t / 60), t % 60, 0, 0);
        const isoStart = start.toISOString();
        result.push({
          id: `${iso}-${startHH}`,
          date: iso,
          startTime: startHH,
          endTime: endHH,
          available: !bookedAt.has(isoStart),
          startAtISO: isoStart,
        });
      }
    }
  }
  return result;
}
