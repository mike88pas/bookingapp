import { Instagram, ArrowUp } from 'lucide-react';
import { SOCIAL_LINKS } from '@/lib/milosz-data';

interface FooterSectionProps {
  onBookClick: () => void;
}

export function FooterSection({ onBookClick }: FooterSectionProps) {
  return (
    <footer className="bg-[#050505] border-t border-white/[0.04] py-12">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left — branding */}
          <div className="text-center md:text-left">
            <p className="font-display text-base uppercase tracking-[0.1em] text-white/60">
              Milosz Kornasiewicz
            </p>
            <p className="text-xs text-white/30 mt-1">
              Trener MMA &bull; Zawodnik QUEST MMA &bull; Krosno
            </p>
            <p className="text-[10px] text-white/15 mt-2">
              &copy; 2026 &bull; Powered by bookingapp
            </p>
          </div>

          {/* Center — social */}
          <div className="flex items-center gap-5">
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs text-white/30 hover:text-brand-400 transition-colors duration-300"
            >
              <Instagram className="w-4 h-4" />
              Sledz na Instagramie
            </a>
          </div>

          {/* Right — scroll CTA */}
          <button
            onClick={onBookClick}
            className="group flex items-center gap-2 text-xs uppercase tracking-wider text-brand-400 hover:text-brand-300 transition-colors duration-300"
          >
            Umow trening
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
}
