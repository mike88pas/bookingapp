import { Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export function GiftVoucherCTA({ tenantSlug }: { tenantSlug: string }) {
  return (
    <section className="bg-gradient-to-r from-brand-900/15 via-[#0b0b0b] to-[#0b0b0b] py-20 md:py-24">
      <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
        <AnimatedSection>
          <Gift className="w-12 h-12 text-brand-500/60 mx-auto animate-pulse-glow" />
          <h2 className="mt-6 font-display text-3xl md:text-5xl font-bold uppercase tracking-tight text-white">
            Podaruj trening, ktory
            <br />
            <span className="text-brand-500">zmienia zycie</span>
          </h2>
          <p className="mt-4 text-sm text-white/50 max-w-lg mx-auto leading-relaxed">
            Voucher na trening MMA — idealny prezent na urodziny, swieta
            lub po prostu tak. Obdarowany sam wybiera termin.
          </p>
          <Link
            to={`/b/${tenantSlug}/voucher`}
            className="mt-8 inline-block px-8 py-3.5 border border-brand-500/30 text-brand-400 uppercase text-sm tracking-[0.15em] font-semibold transition-all duration-200 hover:bg-brand-500/10 hover:border-brand-500/50"
          >
            Kup voucher &rarr;
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
