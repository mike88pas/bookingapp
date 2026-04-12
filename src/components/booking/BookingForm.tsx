import { useState, type FormEvent } from 'react';
import type { Service } from '@bookingapp/shared-types';
import type { ComputedSlot } from '@/lib/slots';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

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

  const priceZl = (service.price / 100).toFixed(0);

  return (
    <AnimatedSection>
      <form
        onSubmit={handleSubmit}
        className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] p-6 md:p-8 space-y-5"
      >
        {/* Slot summary */}
        {selectedSlot && (
          <div className="p-4 border-l-2 border-brand-500 bg-brand-500/[0.04]">
            <div className="text-sm font-semibold text-white">{service.name}</div>
            <div className="text-xs text-white/50 mt-1">
              {new Date(selectedSlot.date).toLocaleDateString('pl-PL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
              {' \u2022 '}
              {selectedSlot.startTime}&ndash;{selectedSlot.endTime}
              {' \u2022 '}
              {service.durationMin} min
              {' \u2022 '}
              {priceZl} {service.currency}
            </div>
          </div>
        )}

        <h3 className="font-display text-xl uppercase tracking-wider text-white">
          Twoje dane
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-white/40 mb-1.5 block">
              Imie i nazwisko
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-white/40 mb-1.5 block">
              Telefon
            </label>
            <input
              type="tel"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              required
              placeholder="+48 600 000 000"
              className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-colors"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[10px] uppercase tracking-[0.15em] text-white/40 mb-1.5 block">
              Email
            </label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-[0.15em] text-white/40 mb-1.5 block">
            Wiadomosc (opcjonalnie)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Twoje cele, doswiadczenie..."
            className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={
            !selectedSlot || !clientName || !clientEmail || !clientPhone || submitting
          }
          className="w-full py-3.5 bg-brand-500 text-white uppercase text-sm tracking-[0.15em] font-semibold transition-all duration-200 hover:bg-brand-600 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-brand-500/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
        >
          {submitting ? 'Przekierowuje do platnosci...' : 'Rezerwuj i zaplac'}
        </button>
      </form>
    </AnimatedSection>
  );
}
