import type { ComputedSlot } from '@/lib/slots';

const DAY_NAMES = ['Nd', 'Pon', 'Wt', 'Sr', 'Czw', 'Pt', 'Sob'];

interface WeeklyCalendarProps {
  slots: ComputedSlot[];
  selectedSlot: ComputedSlot | null;
  onSelect: (slot: ComputedSlot) => void;
}

export function WeeklyCalendar({
  slots,
  selectedSlot,
  onSelect,
}: WeeklyCalendarProps) {
  const dates = [...new Set(slots.map((s) => s.date))].sort();
  const slotsByDate = dates.map((date) => {
    const d = new Date(date);
    return {
      date,
      dayName: DAY_NAMES[d.getDay()],
      dayNum: d.getDate(),
      month: d.toLocaleDateString('pl-PL', { month: 'short' }),
      slots: slots
        .filter((s) => s.date === date)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    };
  });

  if (slotsByDate.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
        Brak dostepnych terminow w wybranym okresie.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${slotsByDate.length}, minmax(120px, 1fr))`,
        }}
      >
        {slotsByDate.map((day) => (
          <div
            key={day.date}
            className="text-center py-2 bg-white/5 rounded-t-lg"
          >
            <div className="text-xs text-white/60">{day.dayName}</div>
            <div className="text-lg font-bold text-white">{day.dayNum}</div>
            <div className="text-xs text-white/60">{day.month}</div>
          </div>
        ))}

        {slotsByDate.map((day) => (
          <div key={`slots-${day.date}`} className="space-y-1">
            {day.slots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;
              return (
                <button
                  key={slot.id}
                  disabled={!slot.available}
                  onClick={() => onSelect(slot)}
                  className={`w-full px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                      : slot.available
                        ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                        : 'bg-white/5 text-white/30 cursor-not-allowed line-through'
                  }`}
                >
                  {slot.startTime}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
