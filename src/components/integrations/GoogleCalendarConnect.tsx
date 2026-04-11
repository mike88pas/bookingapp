import { Calendar, CheckCircle } from 'lucide-react';
import type { TrainerProfile } from '@bookingapp/shared-types';

interface GoogleCalendarConnectProps {
  trainer: TrainerProfile | null;
  onConnect?: () => void;
}

export function GoogleCalendarConnect({
  trainer,
  onConnect,
}: GoogleCalendarConnectProps) {
  const connected = trainer?.googleCalendarConnected ?? false;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <Calendar className="w-8 h-8 text-brand-500 shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-white">Google Calendar</h3>
          <p className="text-sm text-white/60 mt-1">
            Automatyczna synchronizacja rezerwacji z Twoim Google Calendar.
            Wydarzenia tworzone 2-way, z linkiem Meet.
          </p>
          {connected ? (
            <div className="mt-3 inline-flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              Polaczone
            </div>
          ) : (
            <button
              onClick={onConnect}
              className="mt-3 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Polacz Google Calendar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
