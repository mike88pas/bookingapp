import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TenantProvider } from '@/contexts/TenantContext';
import { useTenant } from '@/hooks/useTenant';
import { useAvailability } from '@/hooks/useAvailability';
import { useBookings } from '@/hooks/useBookings';
import { computeSlots, type ComputedSlot } from '@/lib/slots';
import { createBookingAndCheckout } from '@/lib/booking';
import { TenantHero } from '@/components/public/TenantHero';
import { AchievementsList } from '@/components/public/AchievementsList';
import { PartnerClubCard } from '@/components/public/PartnerClubCard';
import { GiftVoucherCTA } from '@/components/public/GiftVoucherCTA';
import { ServicePicker } from '@/components/booking/ServicePicker';
import { WeeklyCalendar } from '@/components/booking/WeeklyCalendar';
import { BookingForm, type BookingFormValues } from '@/components/booking/BookingForm';
import { LoadingSpinner } from '@/components/guards/LoadingSpinner';
import { PackagePicker } from '@/components/packages/PackagePicker';
import type { Service } from '@bookingapp/shared-types';

function TenantContent({ slug }: { slug: string }) {
  const { tenant, trainers, services, loading, error } = useTenant();
  const trainer = trainers[0] ?? null;
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ComputedSlot | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const current = selectedService ?? services[0] ?? null;

  const { weekly, exceptions } = useAvailability(trainer?.id ?? null);
  const { bookings } = useBookings(trainer?.id ?? null, ['confirmed', 'pending_payment']);

  const slots = useMemo(() => {
    if (!current) return [];
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    return computeSlots({
      from,
      daysCount: 7,
      service: current,
      weekly,
      exceptions,
      bookings,
    });
  }, [current, weekly, exceptions, bookings]);

  if (loading) return <LoadingSpinner />;
  if (error || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/70">
        {error ?? 'Nie znaleziono'}
      </div>
    );
  }

  const handleBookingSubmit = async (values: BookingFormValues) => {
    if (!current || !selectedSlot || !trainer) return;
    setSubmitting(true);
    setBookingError(null);
    try {
      const sessionUrl = await createBookingAndCheckout({
        tenantId: tenant.id,
        trainerId: trainer.id,
        trainerName: trainer.name,
        serviceId: current.id,
        serviceName: current.name,
        servicePrice: current.price,
        durationMin: current.durationMin,
        slot: selectedSlot,
        clientName: values.clientName,
        clientEmail: values.clientEmail,
        clientPhone: values.clientPhone,
        notes: values.notes,
      });
      window.location.href = sessionUrl;
    } catch (err) {
      console.error('Booking error:', err);
      setBookingError('Wystapil blad podczas tworzenia rezerwacji. Sprobuj ponownie.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <TenantHero tenant={tenant} trainer={trainer ?? undefined} />
      {trainer?.achievements && (
        <AchievementsList achievements={trainer.achievements} />
      )}
      {tenant.partnerClub && <PartnerClubCard club={tenant.partnerClub} />}
      <GiftVoucherCTA tenantSlug={slug} />

      {trainer && services.length > 0 && (
        <PackagePicker
          tenantId={tenant.id}
          trainerId={trainer.id}
          services={services}
        />
      )}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Wybierz trening</h2>
        <ServicePicker
          services={services}
          selectedId={(selectedService ?? current)?.id ?? null}
          onSelect={(s) => {
            setSelectedService(s);
            setSelectedSlot(null);
          }}
        />
      </section>

      {current && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Terminy</h2>
          <WeeklyCalendar
            slots={slots}
            selectedSlot={selectedSlot}
            onSelect={setSelectedSlot}
          />
        </section>
      )}

      {bookingError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-300">
          {bookingError}
        </div>
      )}

      {current && selectedSlot && (
        <BookingForm
          service={current}
          selectedSlot={selectedSlot}
          submitting={submitting}
          onSubmit={handleBookingSubmit}
        />
      )}
    </div>
  );
}

export function TenantPage() {
  const { tenantSlug = '' } = useParams<{ tenantSlug: string }>();
  return (
    <TenantProvider slug={tenantSlug}>
      <TenantContent slug={tenantSlug} />
    </TenantProvider>
  );
}
