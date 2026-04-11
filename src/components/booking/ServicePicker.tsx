import type { Service } from '@bookingapp/shared-types';

interface ServicePickerProps {
  services: Service[];
  selectedId: string | null;
  onSelect: (service: Service) => void;
}

export function ServicePicker({ services, selectedId, onSelect }: ServicePickerProps) {
  if (services.length === 0) {
    return (
      <div className="text-sm text-white/50 p-4 rounded-xl border border-white/10 bg-white/5">
        Brak dostepnych uslug.
      </div>
    );
  }
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {services.map((s) => {
        const selected = s.id === selectedId;
        const priceZl = (s.price / 100).toFixed(2);
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className={`text-left rounded-2xl border p-4 transition-colors ${
              selected
                ? 'border-brand-500 bg-brand-500/10'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-white">{s.name}</div>
                {s.description && (
                  <div className="text-xs text-white/60 mt-1 line-clamp-2">
                    {s.description}
                  </div>
                )}
                <div className="mt-2 text-xs text-white/50">
                  {s.durationMin} min &middot;{' '}
                  {s.maxParticipants > 1 ? `Grupa do ${s.maxParticipants}` : '1-on-1'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{priceZl}</div>
                <div className="text-xs text-white/50">{s.currency}</div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
