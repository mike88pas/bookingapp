import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import type { Booking } from '@bookingapp/shared-types';
import { db } from '@/lib/firebase';
import { BookingConfirmation } from '@/components/booking/BookingConfirmation';
import { LoadingSpinner } from '@/components/guards/LoadingSpinner';

export function ConfirmationPage() {
  const { bookingId = '', tenantSlug = '' } = useParams<{
    bookingId: string;
    tenantSlug: string;
  }>();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setError('Brak ID rezerwacji');
      setLoading(false);
      return;
    }
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'bookings', bookingId));
        if (snap.exists()) {
          setBooking({ id: snap.id, ...snap.data() } as Booking);
        } else {
          setError('Rezerwacja nie znaleziona');
        }
      } catch {
        setError('Blad ladowania rezerwacji');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bookingId]);

  if (loading) return <LoadingSpinner />;

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">
            {status === 'cancelled' ? 'Platnosc anulowana' : 'Blad'}
          </h1>
          <p className="mt-2 text-white/60">{error ?? 'Cos poszlo nie tak.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <BookingConfirmation booking={booking} tenantSlug={tenantSlug} />
    </div>
  );
}
