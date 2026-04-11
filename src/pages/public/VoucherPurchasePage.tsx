import { useParams, Link } from 'react-router-dom';

export function VoucherPurchasePage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  return (
    <div className="max-w-2xl mx-auto p-8">
      <Link to={`/b/${tenantSlug}`} className="text-white/60 text-sm">
        &larr; Powrot
      </Link>
      <h1 className="text-3xl font-bold text-white mt-4">Kup voucher prezentowy</h1>
      <p className="mt-2 text-white/60">
        TODO Tydzien 3: formularz kupujacego + obdarowanego + Stripe checkout.
      </p>
    </div>
  );
}
