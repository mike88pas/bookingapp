import { Dumbbell, CalendarDays, User } from 'lucide-react';

interface BookingProgressProps {
  currentStep: 1 | 2 | 3;
}

const steps = [
  { num: 1, label: 'TRENING', icon: Dumbbell },
  { num: 2, label: 'TERMIN', icon: CalendarDays },
  { num: 3, label: 'DANE', icon: User },
] as const;

export function BookingProgress({ currentStep }: BookingProgressProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, i) => {
        const active = currentStep >= step.num;
        const Icon = step.icon;
        return (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                  active
                    ? 'bg-brand-500 text-white'
                    : 'bg-white/[0.04] text-white/30 border border-white/[0.08]'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[10px] uppercase tracking-widest font-medium transition-colors duration-300 ${
                  active ? 'text-brand-400' : 'text-white/30'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-12 md:w-20 h-px mx-2 mb-5 transition-colors duration-300 ${
                  currentStep > step.num ? 'bg-brand-500' : 'bg-white/[0.08]'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
