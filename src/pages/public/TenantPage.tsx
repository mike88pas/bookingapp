import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TenantProvider } from '@/contexts/TenantContext';
import { useTenant } from '@/hooks/useTenant';
import { useAvailability } from '@/hooks/useAvailability';
import { useBookings } from '@/hooks/useBookings';
import { computeSlots, type ComputedSlot } from '@/lib/slots';
import { TenantHero } from '@/components/public/TenantHero';
import { AchievementsList } from '@/components/public/AchievementsList';
import { PartnerClubCard } from '@/components/public/PartnerClubCard';
import { GiftVoucherCTA } from '@/components/public/GiftVoucherCTA';
import { ServicePicker } from '@/components/booking/ServicePicker';
import { WeeklyCalendar } from '@/components/booking/WeeklyCalendar';
import { BookingForm, type BookingFormValues } from '@/components/booking/BookingForm';
import { LoadingSpinner } from '@/components/guards/LoadingSpinner';
import type { Service } from '@bookingapp/shared-types';

function TenantContent({ slug }: { slug: string }) {
  const { tenant, trainers, services, loading, error } = useTenant();
  const trainer = trainers[0] ?? null;
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ComputedSlot | null>(null);

  const serviceList = selectedService
    ? services
    : services;
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

  const handleBookingSubmit = (_values: BookingFormValues) => {
    // TODO Tydzien 2: utworz booking{pending_payment} + createCheckoutSession
    console.log('TODO createCheckoutSession', {
      tenantId: tenant.id,
      service: current,
      slot: selectedSlot,
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <TenantHero tenant={tenant} trainer={trainer ?? undefined} />
      {trainer?.achievements && (
        <AchievementsList achievements={trainer.achievements} />
      )}
      {tenant.partnerClub && <PartnerClubCard club={tenant.partnerClub} />}
      <GiftVoucherCTA tenantSlug={slug} />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Wybierz trening</h2>
        <ServicePicker
          services={serviceList}
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

      {current && selectedSlot && (
        <BookingForm
          service={current}
          selectedSlot={selectedSlot}
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
