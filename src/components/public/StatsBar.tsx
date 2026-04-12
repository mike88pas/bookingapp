import { useRef } from 'react';
import { useInView } from 'motion/react';
import { Swords, Target, Flame, Clock } from 'lucide-react';
import { CountUp } from '@/components/ui/CountUp';

const stats = [
  { icon: Swords, value: 4, prefix: '', suffix: '-3', label: 'REKORD' },
  { icon: Target, value: 13, prefix: '#', suffix: ' PL', label: 'RANKING' },
  { icon: Flame, value: 7, prefix: '', suffix: '', label: 'WALK' },
  { icon: Clock, value: 5, prefix: '', suffix: '+', label: 'LAT' },
];

export function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section
      ref={ref}
      className="bg-[#0a0a0a] border-y border-white/[0.05] py-8 md:py-10"
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-5 h-5 text-brand-500/60 mx-auto mb-2" />
              <CountUp
                target={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                inView={inView}
                className="font-display text-3xl md:text-4xl font-bold text-white"
              />
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/35 mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
