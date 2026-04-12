import { Instagram, ArrowUp } from 'lucide-react';
import { SOCIAL_LINKS } from '@/lib/milosz-data';

interface FooterSectionProps {
  onBookClick: () => void;
}

export function FooterSection({ onBookClick }: FooterSectionProps) {
  return (
    <footer className="bg-[#050505] border-t border-white/[0.04] py-10">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left */}
          <div className="text-center md:text-left">
            <p className="font-display text-sm uppercase tracking-[0.15em] text-white/50">
              Milosz Kornasiewicz &bull; Trener MMA &bull; Krosno
            </p>
            <p className="text-[10px] text-white/20 mt-1">
              Powered by bookingapp
            </p>
          </div>

          {/* Center — social */}
          <div className="flex items-center gap-4">
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              <Instagram className="w-4 h-4" />
              @milosz_wp
            </a>
          </div>

          {/* Right — scroll to book */}
          <button
            onClick={onBookClick}
            className="flex items-center gap-2 text-xs uppercase tracking-wider text-brand-400 hover:text-brand-300 transition-colors"
          >
            Zarezerwuj trening
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
