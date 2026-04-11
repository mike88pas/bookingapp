import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Booking } from '@bookingapp/shared-types';

interface BookingConfirmationProps {
  booking: Booking;
  tenantSlug: string;
}

export function BookingConfirmation({ booking, tenantSlug }: BookingConfirmationProps) {
  const startAt = booking.startAt?.toDate?.() ?? new Date();
  const priceZl = (booking.servicePrice / 100).toFixed(2);

  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="bg-emerald-500/10 rounded-2xl p-8 border border-emerald-500/30">
        <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
        <h2 className="font-semibold text-2xl text-white">
          {booking.status === 'confirmed'
            ? 'Rezerwacja potwierdzona!'
            : 'Rezerwacja zapisana'}
        </h2>
        <p className="mt-2 text-white/70">
          {booking.status === 'confirmed'
            ? 'Szczegoly wyslalismy na Twoj email. Do zobaczenia na treningu!'
            : 'Prosimy o dokonczenie platnosci aby potwierdzic termin.'}
        </p>

        <div className="mt-6 bg-white/5 rounded-xl p-4 text-left space-y-2 border border-white/10">
          <Row label="Usluga" value={booking.serviceName} />
          <Row label="Trener" value={booking.trainerName} />
          <Row
            label="Data"
            value={startAt.toLocaleDateString('pl-PL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          />
          <Row
            label="Godzina"
            value={startAt.toLocaleTimeString('pl-PL', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          />
          <Row label="Cena" value={`${priceZl} PLN`} />
        </div>

        <div className="mt-6 flex gap-3 justify-center">
          <Link
            to={`/b/${tenantSlug}`}
            className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium transition-colors"
          >
            Powrot
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-white/50">{label}:</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
