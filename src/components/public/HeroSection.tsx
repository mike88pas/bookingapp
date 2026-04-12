import { motion } from 'motion/react';
import { ChevronDown, Shield, Award, Instagram } from 'lucide-react';
import { MILOSZ_TAGLINE, RECORD_SUMMARY, SOCIAL_LINKS } from '@/lib/milosz-data';
import type { Tenant, TrainerProfile } from '@bookingapp/shared-types';

interface HeroSectionProps {
  tenant: Tenant;
  trainer: TrainerProfile | null;
  onBookClick: () => void;
  onAboutClick: () => void;
}

const fadeIn = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
});

const slideLeft = (delay: number) => ({
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
});

export function HeroSection({
  trainer,
  onBookClick,
  onAboutClick,
}: HeroSectionProps) {
  const name = trainer?.name ?? 'Trener';
  const record = `${RECORD_SUMMARY.wins}-${RECORD_SUMMARY.losses}`;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#080808]">
      {/* Background decorations */}
      <div className="absolute inset-0">
        {/* Diagonal gradient accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-brand-500/[0.04] via-transparent to-transparent" />
        {/* Octagon decoration */}
        <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] octagon-outline border-2 border-brand-500/[0.06] opacity-50" />
        {/* Giant record number */}
        <div className="absolute top-1/2 right-[5%] -translate-y-1/2 select-none pointer-events-none">
          <span className="text-[180px] md:text-[280px] font-display font-bold text-white/[0.02] leading-none">
            {record}
          </span>
        </div>
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <motion.div {...slideLeft(0.1)}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 border border-brand-500/30 rounded text-[11px] uppercase tracking-[0.2em] text-brand-400 font-medium">
              <Award className="w-3.5 h-3.5" />
              QUEST MMA &bull; #13 w Polsce
            </span>
          </motion.div>

          {/* Name */}
          <motion.h1
            {...slideLeft(0.25)}
            className="mt-6 font-display text-5xl sm:text-6xl md:text-8xl font-bold uppercase leading-[0.9] tracking-tight text-white"
          >
            {name.split(' ').map((word, i) => (
              <span key={i} className="block">
                {word}
              </span>
            ))}
          </motion.h1>

          {/* Role */}
          <motion.p
            {...fadeIn(0.4)}
            className="mt-4 text-lg md:text-xl uppercase tracking-[0.15em] text-white/40 font-display"
          >
            {trainer?.role ?? 'Trener MMA | Zawodnik'}
          </motion.p>

          {/* Tagline */}
          <motion.p
            {...fadeIn(0.55)}
            className="mt-6 text-base md:text-lg text-white/60 max-w-lg leading-relaxed"
          >
            {MILOSZ_TAGLINE}
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeIn(0.7)} className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={onBookClick}
              className="px-8 py-3.5 bg-brand-500 text-white uppercase text-sm tracking-[0.15em] font-semibold rounded transition-all duration-200 hover:bg-brand-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-500/20"
            >
              Zarezerwuj trening
            </button>
            <button
              onClick={onAboutClick}
              className="px-8 py-3.5 border border-white/15 text-white/70 uppercase text-sm tracking-[0.15em] font-medium rounded transition-all duration-200 hover:bg-white/[0.04] hover:text-white"
            >
              Poznaj mnie &darr;
            </button>
          </motion.div>

          {/* Trust bar */}
          <motion.div
            {...fadeIn(0.9)}
            className="mt-12 flex items-center gap-6 text-[11px] uppercase tracking-[0.15em] text-white/25"
          >
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              MMA Krosno &bull; Est. 2013
            </span>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-white/50 transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
              @milosz_wp
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="w-5 h-5 text-white/20 animate-bounce" />
      </motion.div>
    </section>
  );
}
