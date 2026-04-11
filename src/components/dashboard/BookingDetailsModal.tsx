import { X } from 'lucide-react';
import type { Booking } from '@bookingapp/shared-types';

interface BookingDetailsModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export function BookingDetailsModal({ booking, onClose }: BookingDetailsModalProps) {
  if (!booking) return null;
  const startAt = booking.startAt?.toDate?.() ?? new Date();
  const priceZl = (booking.servicePrice / 100).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-white">Szczegoly rezerwacji</h3>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <Row label="Usluga" value={booking.serviceName} />
          <Row label="Klient" value={booking.clientName} />
          <Row label="Email" value={booking.clientEmail} />
          <Row label="Telefon" value={booking.clientPhone} />
          <Row
            label="Termin"
            value={startAt.toLocaleString('pl-PL', {
              dateStyle: 'long',
              timeStyle: 'short',
            })}
          />
          <Row label="Czas trwania" value={`${booking.durationMin} min`} />
          <Row label="Cena" value={`${priceZl} PLN`} />
          <Row label="Platnosc" value={booking.paymentMethod} />
          <Row label="Status" value={booking.status} />
          {booking.notes && <Row label="Notatki klienta" value={booking.notes} />}
          {booking.trainerNotes && (
            <Row label="Notatki trenera" value={booking.trainerNotes} />
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-white/50">{label}</span>
      <span className="text-white text-right">{value}</span>
    </div>
  );
}
