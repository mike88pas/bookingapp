import { useParams } from 'react-router-dom';

export function ConfirmationPage() {
  const { bookingId, tenantSlug } = useParams<{
    bookingId: string;
    tenantSlug: string;
  }>();
  return (
    <div className="max-w-2xl mx-auto p-8 text-center">
      <h1 className="text-3xl font-bold text-white">Dziekujemy!</h1>
      <p className="mt-2 text-white/60">
        Rezerwacja <code>{bookingId}</code> dla {tenantSlug}. TODO: pobierz
        booking i pokaz BookingConfirmation.
      </p>
    </div>
  );
}
