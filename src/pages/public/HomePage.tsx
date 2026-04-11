import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-5xl font-bold">bookingapp</h1>
      <p className="mt-4 text-white/60 max-w-xl">
        Platforma rezerwacji treningow dla trenerow personalnych i klubow sportow walki.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          to="/b/milosz-mma"
          className="px-6 py-3 bg-brand-500 hover:bg-brand-600 rounded-xl font-semibold"
        >
          Milosz Kornasiewicz &rarr;
        </Link>
        <Link
          to="/login"
          className="px-6 py-3 border border-white/10 rounded-xl font-semibold"
        >
          Panel trenera
        </Link>
      </div>
    </div>
  );
}
