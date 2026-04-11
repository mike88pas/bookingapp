import { Gift } from 'lucide-react';
import { Link } from 'react-router-dom';

export function GiftVoucherCTA({ tenantSlug }: { tenantSlug: string }) {
  return (
    <Link
      to={`/b/${tenantSlug}/voucher`}
      className="flex items-center justify-between gap-4 rounded-2xl border border-brand-500/30 bg-brand-500/10 hover:bg-brand-500/20 transition-colors p-6"
    >
      <div className="flex items-center gap-4">
        <Gift className="w-10 h-10 text-brand-400" />
        <div>
          <div className="font-semibold text-white">Kup w prezencie</div>
          <div className="text-sm text-white/70">
            Voucher na trening &mdash; idealny pomysl na urodziny, swieta lub Walentynki.
          </div>
        </div>
      </div>
      <div className="text-brand-300 text-sm font-medium">Zamow &rarr;</div>
    </Link>
  );
}
