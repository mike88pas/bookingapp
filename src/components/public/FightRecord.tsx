import { FIGHT_RECORD, RECORD_SUMMARY, type Fight } from '@/lib/milosz-data';
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerGrid';

function FightRow({ fight }: { fight: Fight }) {
  const isWin = fight.result === 'W';
  return (
    <div
      className={`flex items-center gap-3 p-3 bg-white/[0.02] border-l-2 transition-colors ${
        isWin ? 'border-emerald-500/60' : 'border-red-500/60'
      }`}
    >
      <span
        className={`text-xs font-bold uppercase w-5 text-center ${
          isWin ? 'text-emerald-400' : 'text-red-400'
        }`}
      >
        {fight.result}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">
          vs. {fight.opponent}
        </div>
        <div className="text-[11px] text-white/40">
          {fight.event} &bull; {fight.date}
        </div>
      </div>
      <span className="text-[11px] text-white/30 shrink-0">{fight.method}</span>
    </div>
  );
}

export function FightRecord() {
  const { wins, losses, draws } = RECORD_SUMMARY;
  const total = wins + losses + draws;
  const winPct = total > 0 ? Math.round((wins / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1 text-2xl font-display font-bold">
          <span className="text-emerald-400">{wins}W</span>
          <span className="text-white/20">-</span>
          <span className="text-red-400">{losses}L</span>
          {draws > 0 && (
            <>
              <span className="text-white/20">-</span>
              <span className="text-white/50">{draws}D</span>
            </>
          )}
        </div>
        <span className="text-xs text-white/30 uppercase tracking-wider">
          {winPct}% win rate
        </span>
      </div>

      {/* Win bar */}
      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
          style={{ width: `${winPct}%` }}
        />
      </div>

      {/* Fight list */}
      <StaggerContainer className="space-y-1">
        {FIGHT_RECORD.map((fight, i) => (
          <StaggerItem key={i}>
            <FightRow fight={fight} />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}
