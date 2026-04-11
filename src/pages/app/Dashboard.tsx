import { useAuth } from '@/hooks/useAuth';
import { useBookings } from '@/hooks/useBookings';
import { BookingCard } from '@/components/dashboard/BookingCard';

export function Dashboard() {
  const { trainerId, logout } = useAuth();
  const { bookings, loading } = useBookings(trainerId, ['pending_payment', 'confirmed']);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Panel trenera</h1>
        <button
          onClick={logout}
          className="text-sm text-white/60 hover:text-white"
        >
          Wyloguj
        </button>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Nadchodzace rezerwacje</h2>
        {loading ? (
          <div className="text-white/50 text-sm">Laduje...</div>
        ) : bookings.length === 0 ? (
          <div className="text-white/50 text-sm">Brak rezerwacji.</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {bookings.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
