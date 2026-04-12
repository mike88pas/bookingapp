import { useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { Package as PackageIcon } from 'lucide-react';
import type { Service } from '@bookingapp/shared-types';
import { db, functions } from '@/lib/firebase';
import {
  DEFAULT_PACKAGE_EXPIRY_DAYS,
  DEFAULT_PACKAGE_ROLLOVER,
} from '@bookingapp/shared-types';

interface PackagePickerProps {
  tenantId: string;
  trainerId: string;
  services: Service[];
}

const PACKAGE_OPTIONS = [5, 10, 20] as const;

export function PackagePicker({ tenantId, trainerId, services }: PackagePickerProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState<number>(10);
  const [clientEmail, setClientEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = services.find((s) => s.id === selectedServiceId) ?? null;
  const eligibleServices = services.filter((s) => s.maxParticipants === 1);

  const discountPct = selectedCount >= 20 ? 15 : selectedCount >= 10 ? 10 : 5;
  const perSessionPrice = service
    ? Math.round(service.price * (1 - discountPct / 100))
    : 0;
  const totalPrice = perSessionPrice * selectedCount;

  const handlePurchase = async () => {
    if (!service || !clientEmail) return;
    setSubmitting(true);
    setError(null);
    try {
      const expiresAt = Timestamp.fromDate(
        new Date(Date.now() + DEFAULT_PACKAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
      );

      const pkgRef = await addDoc(collection(db, 'packages'), {
        tenantId,
        clientId: '',
        trainerId,
        serviceId: service.id,
        totalSessions: selectedCount,
        usedSessions: 0,
        rolloverAllowed: DEFAULT_PACKAGE_ROLLOVER,
        purchasedAt: Timestamp.now(),
        expiresAt,
        price: totalPrice,
        status: 'active', // will be set to active by stripeWebhook on payment
      });

      const callable = httpsCallable<
        { packageId: string; mode: string },
        { sessionUrl: string }
      >(functions, 'createCheckoutSession');

      const result = await callable({ packageId: pkgRef.id, mode: 'package' });
      if (result.data.sessionUrl) {
        window.location.href = result.data.sessionUrl;
      }
    } catch (err) {
      console.error('Package purchase error:', err);
      setError('Blad podczas tworzenia pakietu. Sprobuj ponownie.');
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
        <PackageIcon className="w-5 h-5 text-brand-400" />
        Pakiety treningowe
      </h2>
      <p className="text-sm text-white/60">
        Kup pakiet i oszczedz do {discountPct}%. Wazny {DEFAULT_PACKAGE_EXPIRY_DAYS} dni od zakupu.
      </p>

      {/* Service picker */}
      <div className="flex flex-wrap gap-2">
        {eligibleServices.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedServiceId(s.id)}
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
              s.id === selectedServiceId
                ? 'bg-brand-500 text-white'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {service && (
        <>
          {/* Count picker */}
          <div className="flex gap-2">
            {PACKAGE_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setSelectedCount(n)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  n === selectedCount
                    ? 'bg-brand-500 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {n}x
              </button>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white/5 rounded-xl p-4 text-sm space-y-1">
            <div className="flex justify-between text-white/60">
              <span>Cena za sesje (z rabatem -{discountPct}%)</span>
              <span>{(perSessionPrice / 100).toFixed(2)} PLN</span>
            </div>
            <div className="flex justify-between font-semibold text-white text-base">
              <span>Razem ({selectedCount}x)</span>
              <span>{(totalPrice / 100).toFixed(2)} PLN</span>
            </div>
          </div>

          {/* Email */}
          <input
            type="email"
            placeholder="Twoj email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
          />

          {error && (
            <div className="text-sm text-red-300 bg-red-500/10 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            onClick={handlePurchase}
            disabled={!clientEmail || submitting}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold disabled:opacity-50"
          >
            {submitting ? 'Przekierowuje...' : `Kup pakiet ${selectedCount}x`}
          </button>
        </>
      )}
    </section>
  );
}
