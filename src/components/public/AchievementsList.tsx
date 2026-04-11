import { Trophy } from 'lucide-react';

interface AchievementsListProps {
  achievements: string[];
}

export function AchievementsList({ achievements }: AchievementsListProps) {
  if (!achievements || achievements.length === 0) return null;
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
        <Trophy className="w-5 h-5 text-amber-400" />
        Osiagniecia
      </h2>
      <ul className="mt-4 grid gap-2 md:grid-cols-2">
        {achievements.map((a, i) => (
          <li
            key={i}
            className="text-sm text-white/80 flex items-start gap-2 before:content-['\25C6'] before:text-brand-400 before:text-xs before:mt-1"
          >
            <span>{a}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
