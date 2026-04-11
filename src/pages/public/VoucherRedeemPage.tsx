import { useParams } from 'react-router-dom';

export function VoucherRedeemPage() {
  const { voucherCode } = useParams<{ voucherCode: string }>();
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-white">Realizacja voucheru</h1>
      <p className="mt-2 text-white/60">
        Kod: <code className="text-brand-400">{voucherCode}</code>
      </p>
      <p className="mt-2 text-white/60">
        TODO Tydzien 3: wybor slota + booking z paymentMethod=voucher.
      </p>
    </div>
  );
}
