import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { FightRecord } from './FightRecord';
import { MILOSZ_BIO, SPECIALIZATIONS } from '@/lib/milosz-data';

export function AboutSection() {
  return (
    <section id="about" className="bg-[#0b0b0b] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Section header */}
        <AnimatedSection direction="left">
          <h2 className="font-display text-3xl md:text-5xl font-bold uppercase tracking-tight text-white">
            Nie tylko trener.
            <br />
            <span className="text-gradient-animate">Zawodnik.</span>
          </h2>
        </AnimatedSection>

        <div className="mt-12 grid md:grid-cols-2 gap-12 md:gap-16">
          {/* Left — bio */}
          <AnimatedSection direction="left" delay={0.15}>
            <div className="space-y-6">
              <p className="text-base text-white/60 leading-relaxed">
                {MILOSZ_BIO}
              </p>

              {/* Specializations */}
              <div className="flex flex-wrap gap-2">
                {SPECIALIZATIONS.map((spec) => (
                  <span
                    key={spec}
                    className="px-3 py-1.5 text-xs uppercase tracking-wider text-brand-400 border border-brand-500/20 bg-brand-500/[0.05] rounded"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Right — fight record */}
          <AnimatedSection direction="right" delay={0.25}>
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-4">
                Rekord walk
              </h3>
              <FightRecord />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
