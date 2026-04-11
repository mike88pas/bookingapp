import { MapPin, ExternalLink } from 'lucide-react';
import type { PartnerClub } from '@bookingapp/shared-types';

export function PartnerClubCard({ club }: { club: PartnerClub }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-start gap-4">
        {club.logoUrl && (
          <img
            src={club.logoUrl}
            alt={club.name}
            className="w-16 h-16 rounded-xl object-cover border border-white/10"
          />
        )}
        <div className="flex-1">
          <div className="text-xs uppercase tracking-widest text-white/50">
            Klub partnerski
          </div>
          <h3 className="text-xl font-semibold text-white">{club.name}</h3>
          <div className="mt-1 flex items-center text-sm text-white/70 gap-1">
            <MapPin className="w-4 h-4" />
            {club.address}
          </div>
          {club.url && (
            <a
              href={club.url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300"
            >
              Strona klubu <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
