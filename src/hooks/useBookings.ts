import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import type { Booking, BookingStatus } from '@bookingapp/shared-types';
import { db } from '@/lib/firebase';

export interface BookingsResult {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}

export function useBookings(
  trainerId: string | null,
  statusFilter?: BookingStatus[]
): BookingsResult {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trainerId) {
      setBookings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const constraints = [
      where('trainerId', '==', trainerId),
      orderBy('startAt', 'desc'),
    ];
    const q = query(collection(db, 'bookings'), ...constraints);
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Booking
        );
        setBookings(
          statusFilter ? list.filter((b) => statusFilter.includes(b.status)) : list
        );
        setLoading(false);
      },
      (e) => {
        console.error('useBookings error', e);
        setError('Blad ladowania rezerwacji');
        setLoading(false);
      }
    );
    return unsub;
  }, [trainerId, statusFilter?.join(',')]);

  return { bookings, loading, error };
}
