import { useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { Crown, Flame } from 'lucide-react';
import type { Service } from '@bookingapp/shared-types';
import { db, functions } from '@/lib/firebase';
import {
  DEFAULT_PACKAGE_EXPIRY_DAYS,
  DEFAULT_PACKAGE_ROLLOVER,
} from '@bookingapp/shared-types';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerGrid';

interface PackagePickerProps {
  tenantId: string;
  trainerId: string;
  services: Service[];
}

const TIERS = [
  { count: 5, discountPct: 5, label: '5x', badge: null },
  { count: 10, discountPct: 10, label: '10x', badge: 'NAJPOPULARNIEJSZY' },
  { count: 20, discountPct: 15, label: '20x', badge: 'NAJLEPSZA WARTOSC' },
] as const;

export function PackagePicker({ tenantId, trainerId, services }: PackagePickerProps) {
  const eligibleServices = services.filter((s) => s.maxParticipants === 1);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState(1); // index into TIERS
  const [clientEmail, setClientEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = eligibleServices.find((s) => s.id === selectedServiceId) ?? null;
  const tier = TIERS[selectedTier];

  const perSessionPrice = service
    ? Math.round(service.price * (1 - tier.discountPct / 100))
    : 0;
  const totalPrice = perSessionPrice * tier.count;

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
        totalSessions: tier.count,
        usedSessions: 0,
        rolloverAllowed: DEFAULT_PACKAGE_ROLLOVER,
        purchasedAt: Timestamp.now(),
        expiresAt,
        price: totalPrice,
        status: 'active',
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
      setError('Blad podczas tworzenia pakietu.');
      setSubmitting(false);
    }
  };

  return (
    <section id="packages" className="bg-[#0d0d0d] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <AnimatedSection direction="left">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-500/70 mb-3">
            Karnety
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold uppercase tracking-tight text-white">
            Trenuj regularnie.{' '}
            <span className="text-gradient-brand">Plac mniej.</span>
          </h2>
          <p className="mt-3 text-sm text-white/50 max-w-lg leading-relaxed normal-case tracking-normal">
            Pakiet treningow z rabatem do 15%. Wazny 60 dni &mdash;
            wystarczajaco dlugo, zebys zobaczyl efekty.
          </p>
        </AnimatedSection>

        {/* Service selector */}
        <div className="mt-8 flex flex-wrap gap-2">
          {eligibleServices.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedServiceId(s.id)}
              className={`text-xs uppercase tracking-wider px-4 py-2 transition-all duration-200 ${
                s.id === selectedServiceId
                  ? 'bg-brand-500 text-white'
                  : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:bg-white/[0.06]'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        {service && (
          <>
            {/* Tier cards */}
            <StaggerContainer className="mt-8 grid md:grid-cols-3 gap-4">
              {TIERS.map((t, i) => {
                const isSelected = i === selectedTier;
                const isFeatured = t.badge === 'NAJPOPULARNIEJSZY';
                const isValue = t.badge === 'NAJLEPSZA WARTOSC';
                const sessionPrice = Math.round(
                  service.price * (1 - t.discountPct / 100)
                );
                const total = sessionPrice * t.count;

                return (
                  <StaggerItem key={t.count}>
                    <button
                      onClick={() => setSelectedTier(i)}
                      className={`relative text-left w-full p-6 border transition-all duration-300 ${
                        isFeatured ? 'md:scale-105 md:-my-2' : ''
                      } ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500/[0.06] shadow-lg shadow-brand-500/10'
                          : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                      }`}
                    >
                      {t.badge && (
                        <span
                          className={`absolute -top-3 left-4 px-3 py-1 text-[9px] uppercase tracking-[0.2em] font-bold ${
                            isFeatured
                              ? 'bg-brand-500 text-white animate-shimmer bg-gradient-to-r from-brand-500 via-brand-400 to-brand-500 bg-[length:200%_100%]'
                              : 'bg-gold-500 text-black'
                          }`}
                        >
                          {isFeatured && <Flame className="w-3 h-3 inline mr-1" />}
                          {isValue && <Crown className="w-3 h-3 inline mr-1" />}
                          {t.badge}
                        </span>
                      )}

                      <div className="font-display text-4xl font-bold text-white">
                        {t.label}
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.15em] text-white/40 mt-1">
                        sesji &bull; -{t.discountPct}% rabat
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/[0.06]">
                        <div className="text-xs text-white/40">
                          {(sessionPrice / 100).toFixed(0)} PLN / sesja
                        </div>
                        <div className="font-display text-2xl font-bold text-white mt-1">
                          {(total / 100).toFixed(0)}{' '}
                          <span className="text-sm text-white/40">PLN</span>
                        </div>
                      </div>
                    </button>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>

            {/* Email + purchase */}
            <div className="mt-6 max-w-md mx-auto space-y-3">
              <input
                type="email"
                placeholder="Twoj email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-500/50 transition-colors"
              />
              {error && (
                <div className="text-xs text-red-400 bg-red-500/10 px-3 py-2">
                  {error}
                </div>
              )}
              <button
                onClick={handlePurchase}
                disabled={!clientEmail || submitting}
                className="w-full py-3.5 bg-brand-500 text-white uppercase text-sm tracking-[0.15em] font-semibold transition-all duration-200 hover:bg-brand-600 shadow-lg shadow-brand-500/20 disabled:opacity-30"
              >
                {submitting
                  ? 'Przekierowuje...'
                  : `Kup pakiet ${tier.label} — ${(totalPrice / 100).toFixed(0)} PLN`}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
