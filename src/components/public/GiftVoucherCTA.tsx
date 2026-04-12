import { Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export function GiftVoucherCTA({ tenantSlug }: { tenantSlug: string }) {
  return (
    <section className="bg-gradient-to-r from-brand-900/15 via-[#0b0b0b] to-[#0b0b0b] py-20 md:py-24">
      <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
        <AnimatedSection>
          <Gift className="w-12 h-12 text-brand-500/60 mx-auto animate-pulse-glow" />

          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-brand-500/70">
            Voucher prezentowy
          </p>

          <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold uppercase tracking-tight text-white">
            Prezent, ktory{' '}
            <span className="text-gradient-brand">zostaje w ciele</span>
          </h2>

          <p className="mt-5 text-sm text-white/50 max-w-md mx-auto leading-relaxed">
            Trening MMA to nie gadget &mdash; to doswiadczenie.
            Obdarowany sam wybiera termin i rodzaj treningu.
            Voucher wazny 12 miesiecy.
          </p>

          <div className="mt-4 text-xs text-white/30">
            Na urodziny &bull; Na swieta &bull; Na Walentynki &bull; Albo po prostu tak
          </div>

          <Link
            to={`/b/${tenantSlug}/voucher`}
            className="mt-8 inline-block px-8 py-3.5 border border-brand-500/30 text-brand-400 uppercase text-sm tracking-[0.15em] font-semibold transition-all duration-300 hover:bg-brand-500/10 hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/10"
          >
            Kup voucher &rarr;
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
