import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { FightRecord } from './FightRecord';
import { MILOSZ_BIO, MILOSZ_BIO_INTRO, SPECIALIZATIONS } from '@/lib/milosz-data';

export function AboutSection() {
  return (
    <section id="about" className="bg-[#0b0b0b] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Section header */}
        <AnimatedSection direction="left">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-500/70 mb-3">
            O mnie
          </p>
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
              <p className="text-lg text-white/80 font-medium leading-relaxed">
                {MILOSZ_BIO_INTRO}
              </p>
              {MILOSZ_BIO.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-sm text-white/50 leading-relaxed">
                  {paragraph}
                </p>
              ))}

              {/* Specializations */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3">
                  Specjalizacje
                </p>
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
            </div>
          </AnimatedSection>

          {/* Right — fight record */}
          <AnimatedSection direction="right" delay={0.25}>
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-4">
                Historia walk &mdash; QUEST MMA
              </h3>
              <FightRecord />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
