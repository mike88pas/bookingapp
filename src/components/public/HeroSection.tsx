import { motion } from 'motion/react';
import { ChevronDown, Shield, Dumbbell, Instagram } from 'lucide-react';
import { MILOSZ_TAGLINE, SOCIAL_LINKS } from '@/lib/milosz-data';
import { ParticleField } from '@/components/ui/ParticleField';
import { GradientOrbs } from '@/components/ui/GradientOrbs';
import type { Tenant, TrainerProfile } from '@bookingapp/shared-types';

interface HeroSectionProps {
  tenant: Tenant;
  trainer: TrainerProfile | null;
  onBookClick: () => void;
  onAboutClick: () => void;
}

const ease = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

const fadeIn = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease },
});

const slideLeft = (delay: number) => ({
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, delay, ease },
});

export function HeroSection({
  trainer,
  onBookClick,
  onAboutClick,
}: HeroSectionProps) {
  const name = trainer?.name ?? 'Trener';

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#080808] scan-line">
      {/* Gradient orbs (Apple-style ambient glow) */}
      <GradientOrbs />

      {/* Canvas particle network */}
      <div className="absolute inset-0">
        <ParticleField />
      </div>

      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Octagon decoration */}
        <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] octagon-outline border-2 border-brand-500/[0.06] opacity-50" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Horizontal line accent */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-500/[0.08] to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          {/* Badge */}
          <motion.div {...slideLeft(0.1)}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 border border-brand-500/30 bg-brand-500/[0.06] backdrop-blur-sm rounded text-[11px] uppercase tracking-[0.2em] text-brand-400 font-medium">
              <Dumbbell className="w-3.5 h-3.5" />
              TRENER PERSONALNY
            </span>
          </motion.div>

          {/* Name with gradient text */}
          <motion.h1
            {...slideLeft(0.25)}
            className="mt-6 font-display text-5xl sm:text-6xl md:text-8xl font-bold uppercase leading-[0.9] tracking-tight"
          >
            {name.split(' ').map((word, i) => (
              <span
                key={i}
                className={`block ${i === 1 ? 'text-gradient-animate' : 'text-white'}`}
              >
                {word}
              </span>
            ))}
          </motion.h1>

          {/* Role */}
          <motion.p
            {...fadeIn(0.4)}
            className="mt-4 text-lg md:text-xl uppercase tracking-[0.15em] text-white/40 font-display"
          >
            Trener MMA &bull; Zawodnik MMA &bull; Krosno
          </motion.p>

          {/* Tagline */}
          <motion.p
            {...fadeIn(0.55)}
            className="mt-6 text-base md:text-lg text-white/60 max-w-lg leading-relaxed"
          >
            {MILOSZ_TAGLINE}
          </motion.p>

          {/* Social proof line */}
          <motion.p
            {...fadeIn(0.6)}
            className="mt-2 text-xs text-white/30"
          >
            7 walk w klatce &bull; 10+ lat na macie &bull; MMA Krosno
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeIn(0.7)} className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={onBookClick}
              className="group relative px-8 py-3.5 bg-brand-500 text-white uppercase text-sm tracking-[0.15em] font-semibold rounded transition-all duration-300 hover:bg-brand-600 hover:scale-[1.03] active:scale-[0.98] shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/35"
            >
              <span className="relative z-10">Zarezerwuj trening</span>
              {/* Button glow */}
              <div className="absolute inset-0 rounded bg-brand-500 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
            </button>
            <button
              onClick={onAboutClick}
              className="px-8 py-3.5 border border-white/15 bg-white/[0.03] backdrop-blur-sm text-white/70 uppercase text-sm tracking-[0.15em] font-medium rounded transition-all duration-300 hover:bg-white/[0.06] hover:text-white hover:border-white/25"
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
              className="flex items-center gap-1.5 hover:text-brand-400 transition-colors duration-300"
            >
              <Instagram className="w-3.5 h-3.5" />
              @milosz_wp
            </a>
          </motion.div>
        </div>

        {/* Hero image — right column (desktop only) */}
        <motion.div
          {...fadeIn(0.5)}
          className="hidden lg:flex justify-center items-center"
        >
          <div className="relative">
            <img
              src="/images/milosz-hero.webp"
              alt="Milosz Kornasiewicz — Trener MMA"
              className="relative z-10 w-full max-w-md object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).parentElement!.style.display = 'none';
              }}
            />
            {/* Red gradient glow behind image */}
            <div className="absolute inset-0 bg-brand-500/20 blur-3xl rounded-full -z-0 scale-110" />
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[9px] uppercase tracking-[0.2em] text-white/20">Scrolluj</span>
        <ChevronDown className="w-4 h-4 text-white/20 animate-bounce" />
      </motion.div>
    </section>
  );
}
