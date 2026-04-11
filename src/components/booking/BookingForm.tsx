import { useState, type FormEvent } from 'react';
import type { Service } from '@bookingapp/shared-types';
import type { ComputedSlot } from '@/lib/slots';

export interface BookingFormValues {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
}

interface BookingFormProps {
  service: Service;
  selectedSlot: ComputedSlot | null;
  submitting?: boolean;
  onSubmit: (values: BookingFormValues) => void;
}

export function BookingForm({
  service,
  selectedSlot,
  submitting,
  onSubmit,
}: BookingFormProps) {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !clientName || !clientEmail || !clientPhone) return;
    onSubmit({ clientName, clientEmail, clientPhone, notes: notes || undefined });
  };

  const priceZl = (service.price / 100).toFixed(2);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/5 rounded-2xl p-6 border border-white/10"
    >
      <h3 className="font-semibold text-xl text-white mb-4">Twoje dane</h3>

      {selectedSlot && (
        <div className="mb-4 px-4 py-3 bg-brand-500/10 border border-brand-500/40 rounded-xl text-sm">
          <div className="font-medium text-brand-300">{service.name}</div>
          <div className="text-white/80">
            {new Date(selectedSlot.date).toLocaleDateString('pl-PL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
            {', '}
            {selectedSlot.startTime}&ndash;{selectedSlot.endTime}
          </div>
          <div className="text-white/60 text-xs mt-1">
            {service.durationMin} min &middot; {priceZl} {service.currency}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-white/60 mb-1 block">
            Imie i nazwisko *
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-white/60 mb-1 block">
            Telefon *
          </label>
          <input
            type="tel"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            required
            placeholder="+48 600 000 000"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-white/60 mb-1 block">
            Email *
          </label>
          <input
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            required
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-xs font-medium text-white/60 mb-1 block">
          Wiadomosc (opcjonalnie)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Twoje cele, doswiadczenie, pytania..."
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
      </div>

      <button
        type="submit"
        disabled={
          !selectedSlot || !clientName || !clientEmail || !clientPhone || submitting
        }
        className="mt-4 w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold transition-all disabled:bg-white/20 disabled:cursor-not-allowed"
      >
        {submitting ? 'Przekierowuje do platnosci...' : 'Rezerwuj i zaplac'}
      </button>
    </form>
  );
}
