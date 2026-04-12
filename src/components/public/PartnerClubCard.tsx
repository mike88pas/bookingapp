import { MapPin, ExternalLink } from 'lucide-react';
import type { PartnerClub } from '@bookingapp/shared-types';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export function PartnerClubCard({ club }: { club: PartnerClub }) {
  return (
    <section className="bg-[#0b0b0b] py-16">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <AnimatedSection>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 border border-white/[0.05] bg-white/[0.01]">
            {club.logoUrl && (
              <img
                src={club.logoUrl}
                alt={club.name}
                className="w-14 h-14 rounded object-cover border border-white/[0.08]"
              />
            )}
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                Gdzie trenujemy
              </p>
              <h3 className="font-display text-xl uppercase font-bold text-white">
                {club.name}
              </h3>
              <p className="text-xs text-white/40 mt-0.5">
                Klub zal. 2013 przez Adama Tomasika. Tu sie zaczela moja droga.
              </p>
              <div className="mt-1.5 flex items-center text-xs text-white/30 gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {club.address}
              </div>
            </div>
            {club.url && (
              <a
                href={club.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-brand-400 hover:text-brand-300 transition-colors"
              >
                Strona klubu <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
