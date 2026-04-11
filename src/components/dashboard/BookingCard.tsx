import type { Booking, BookingStatus } from '@bookingapp/shared-types';
import { Clock, User, Mail, Phone } from 'lucide-react';

interface BookingCardProps {
  booking: Booking;
  onClick?: () => void;
}

const STATUS_STYLES: Record<BookingStatus, { label: string; className: string }> = {
  pending_payment: {
    label: 'Oczekuje platnosci',
    className: 'bg-amber-500/20 text-amber-300',
  },
  confirmed: {
    label: 'Potwierdzona',
    className: 'bg-emerald-500/20 text-emerald-300',
  },
  completed: {
    label: 'Zakonczona',
    className: 'bg-sky-500/20 text-sky-300',
  },
  cancelled_by_client: {
    label: 'Anulowana (klient)',
    className: 'bg-white/10 text-white/50',
  },
  cancelled_by_trainer: {
    label: 'Anulowana (trener)',
    className: 'bg-white/10 text-white/50',
  },
  no_show: {
    label: 'No show',
    className: 'bg-red-500/20 text-red-300',
  },
};

export function BookingCard({ booking, onClick }: BookingCardProps) {
  const startAt = booking.startAt?.toDate?.() ?? new Date();
  const status = STATUS_STYLES[booking.status];

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-white truncate">{booking.serviceName}</div>
          <div className="mt-1 flex items-center text-xs text-white/60 gap-1">
            <Clock className="w-3.5 h-3.5" />
            {startAt.toLocaleString('pl-PL', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          <div className="mt-2 space-y-1 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              {booking.clientName}
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              {booking.clientEmail}
            </div>
            {booking.clientPhone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" />
                {booking.clientPhone}
              </div>
            )}
          </div>
        </div>
        <span
          className={`text-[10px] uppercase tracking-wide px-2 py-1 rounded-full ${status.className}`}
        >
          {status.label}
        </span>
      </div>
    </button>
  );
}
