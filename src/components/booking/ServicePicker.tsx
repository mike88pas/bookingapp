import { Swords, Target, Dumbbell } from 'lucide-react';
import type { Service } from '@bookingapp/shared-types';
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerGrid';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

interface ServicePickerProps {
  services: Service[];
  selectedId: string | null;
  onSelect: (service: Service) => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  mma: Swords,
  fitness: Dumbbell,
  yoga: Target,
  physio: Target,
  other: Dumbbell,
};

export function ServicePicker({ services, selectedId, onSelect }: ServicePickerProps) {
  if (services.length === 0) {
    return (
      <div className="text-sm text-white/40 p-6 border border-white/[0.06] bg-white/[0.02]">
        Brak dostepnych uslug.
      </div>
    );
  }

  return (
    <section id="services" className="bg-[#0d0d0d] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <AnimatedSection direction="left">
          <h2 className="font-display text-3xl md:text-5xl font-bold uppercase tracking-tight text-white">
            Wybierz swoj <span className="text-brand-500">trening</span>
          </h2>
          <p className="mt-3 text-sm text-white/40 uppercase tracking-wider">
            Od 1-na-1 po sparringi grupowe — kazdy poziom, kazdy cel.
          </p>
        </AnimatedSection>

        <StaggerContainer className="mt-10 grid gap-4 md:grid-cols-2">
          {services.map((s, i) => {
            const selected = s.id === selectedId;
            const Icon = categoryIcons[s.category] ?? Dumbbell;
            const priceZl = (s.price / 100).toFixed(0);
            const isPopular = i === 0;

            return (
              <StaggerItem key={s.id}>
                <button
                  onClick={() => onSelect(s)}
                  className={`relative text-left w-full p-5 border-l-2 transition-all duration-300 ${
                    selected
                      ? 'border-brand-500 bg-brand-500/[0.06]'
                      : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.15] hover:-translate-y-0.5'
                  } ${selected ? 'shadow-lg shadow-brand-500/10' : 'hover:shadow-md hover:shadow-white/[0.02]'}`}
                >
                  {isPopular && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] font-semibold text-brand-400 bg-brand-500/10 border border-brand-500/20 animate-shimmer bg-gradient-to-r from-brand-500/10 via-brand-500/25 to-brand-500/10">
                      Popularne
                    </span>
                  )}

                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${
                        selected
                          ? 'bg-brand-500/15 text-brand-400'
                          : 'bg-white/[0.04] text-white/30'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white">{s.name}</div>
                      {s.description && (
                        <div className="text-xs text-white/40 mt-1 line-clamp-2">
                          {s.description}
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-3 text-xs text-white/30">
                        <span>{s.durationMin} min</span>
                        <span>&bull;</span>
                        <span>
                          {s.maxParticipants > 1
                            ? `Grupa do ${s.maxParticipants}`
                            : '1-on-1'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display text-xl font-bold text-white">
                        {priceZl}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-white/30">
                        {s.currency}
                      </div>
                    </div>
                  </div>
                </button>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
