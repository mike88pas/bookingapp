import { useEffect, useState } from 'react';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { Save, CheckCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import type { Availability, DayOfWeek, TimeSlot } from '@bookingapp/shared-types';
import { DAYS_OF_WEEK } from '@bookingapp/shared-types';
import { db } from '@/lib/firebase';

const DAY_LABELS: Record<DayOfWeek, string> = {
  mon: 'Poniedzialek',
  tue: 'Wtorek',
  wed: 'Sroda',
  thu: 'Czwartek',
  fri: 'Piatek',
  sat: 'Sobota',
  sun: 'Niedziela',
};

const ALL_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
];

interface AvailabilityManagerProps {
  tenantId: string;
  trainerId: string;
}

interface DayState {
  active: boolean;
  slots: Set<string>; // "HH:mm" — przechowujemy starty godzinowych blokow
}

function slotsToTimeBlocks(starts: string[]): TimeSlot[] {
  // Grupujemy kolejne bloki 1h w ciagly TimeSlot
  const sorted = [...starts].sort();
  const blocks: TimeSlot[] = [];
  for (const start of sorted) {
    const [h, m] = start.split(':').map(Number);
    const end = `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const last = blocks[blocks.length - 1];
    if (last && last.end === start) {
      last.end = end;
    } else {
      blocks.push({ start, end });
    }
  }
  return blocks;
}

function timeBlocksToStarts(slots: TimeSlot[]): string[] {
  const out: string[] = [];
  for (const s of slots) {
    let [h, m] = s.start.split(':').map(Number);
    const [eh, em] = s.end.split(':').map(Number);
    const endMin = eh * 60 + em;
    while (h * 60 + m < endMin) {
      out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      h += 1;
    }
  }
  return out;
}

export function AvailabilityManager({ tenantId, trainerId }: AvailabilityManagerProps) {
  const [days, setDays] = useState<Record<DayOfWeek, DayState>>(() => {
    const init = {} as Record<DayOfWeek, DayState>;
    for (const d of DAYS_OF_WEEK) init[d] = { active: false, slots: new Set() };
    return init;
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const snap = await getDocs(
          query(collection(db, 'availability'), where('trainerId', '==', trainerId))
        );
        if (cancelled) return;
        const init = {} as Record<DayOfWeek, DayState>;
        for (const d of DAYS_OF_WEEK) init[d] = { active: false, slots: new Set() };
        snap.docs.forEach((d) => {
          const data = d.data() as Availability;
          if (DAYS_OF_WEEK.includes(data.dayOfWeek)) {
            init[data.dayOfWeek] = {
              active: data.active,
              slots: new Set(timeBlocksToStarts(data.slots || [])),
            };
          }
        });
        setDays(init);
      } catch (e) {
        console.error('AvailabilityManager load error', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [trainerId]);

  const toggleDayActive = (day: DayOfWeek) => {
    setDays((p) => ({ ...p, [day]: { ...p[day], active: !p[day].active } }));
    setSaved(false);
  };

  const toggleSlot = (day: DayOfWeek, slot: string) => {
    setDays((p) => {
      const newSlots = new Set(p[day].slots);
      if (newSlots.has(slot)) newSlots.delete(slot);
      else newSlots.add(slot);
      return { ...p, [day]: { ...p[day], slots: newSlots } };
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      for (const day of DAYS_OF_WEEK) {
        const id = `${trainerId}_${day}`;
        const slots = slotsToTimeBlocks(Array.from(days[day].slots));
        const payload: Availability = {
          id,
          tenantId,
          trainerId,
          dayOfWeek: day,
          slots,
          active: days[day].active,
        };
        await setDoc(doc(db, 'availability', id), payload);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('AvailabilityManager save error', e);
      setError('Wystapil blad podczas zapisywania.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60">
        Zaznacz dni i godziny, w ktorych przyjmujesz klientow. Godzinowe bloki
        zostana automatycznie scalone.
      </p>

      {error && (
        <div className="bg-red-500/10 text-red-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className={`bg-white/5 rounded-xl border p-4 transition-colors ${
              days[day].active ? 'border-brand-500/40' : 'border-white/10 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-white">{DAY_LABELS[day]}</span>
              <button
                onClick={() => toggleDayActive(day)}
                className="flex items-center gap-2 text-sm"
              >
                {days[day].active ? (
                  <ToggleRight className="w-8 h-8 text-brand-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-white/30" />
                )}
              </button>
            </div>

            {days[day].active && (
              <div className="flex flex-wrap gap-2">
                {ALL_SLOTS.map((slot) => {
                  const selected = days[day].slots.has(slot);
                  return (
                    <button
                      key={slot}
                      onClick={() => toggleSlot(day, slot)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selected
                          ? 'bg-brand-500 text-white'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/40 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2"
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4" /> Zapisano!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> {saving ? 'Zapisuje...' : 'Zapisz dostepnosc'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
