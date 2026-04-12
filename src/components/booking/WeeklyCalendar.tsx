import { motion } from 'motion/react';
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
      <div className="border border-white/[0.06] bg-white/[0.02] p-8 text-center text-sm text-white/40">
        Brak dostepnych terminow w wybranym okresie.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${slotsByDate.length}, minmax(110px, 1fr))`,
        }}
      >
        {/* Day headers */}
        {slotsByDate.map((day, i) => (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="text-center py-3 bg-white/[0.03] border-b border-white/[0.06]"
          >
            <div className="text-[10px] uppercase tracking-[0.15em] text-white/40">
              {day.dayName}
            </div>
            <div className="text-lg font-display font-bold text-white">
              {day.dayNum}
            </div>
            <div className="text-[10px] text-white/30">{day.month}</div>
          </motion.div>
        ))}

        {/* Slot columns */}
        {slotsByDate.map((day, colIdx) => (
          <motion.div
            key={`slots-${day.date}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: colIdx * 0.06 + 0.2, duration: 0.3 }}
            className="space-y-1"
          >
            {day.slots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;
              return (
                <button
                  key={slot.id}
                  disabled={!slot.available}
                  onClick={() => onSelect(slot)}
                  className={`w-full px-2 py-2 text-xs font-medium transition-all duration-200 ${
                    isSelected
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                      : slot.available
                        ? 'bg-white/[0.03] text-emerald-400/80 border border-emerald-500/15 hover:bg-emerald-500/[0.08] hover:border-emerald-500/30'
                        : 'bg-white/[0.01] text-white/20 cursor-not-allowed line-through'
                  }`}
                >
                  {slot.startTime}
                </button>
              );
            })}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
