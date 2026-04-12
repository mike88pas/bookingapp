import { useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TenantProvider } from '@/contexts/TenantContext';
import { useTenant } from '@/hooks/useTenant';
import { useAvailability } from '@/hooks/useAvailability';
import { useBookings } from '@/hooks/useBookings';
import { computeSlots, type ComputedSlot } from '@/lib/slots';
import { createBookingAndCheckout } from '@/lib/booking';
import type { Service } from '@bookingapp/shared-types';

// New CAGE design sections
import { NoiseTexture } from '@/components/ui/NoiseTexture';
import { DiagonalDivider } from '@/components/ui/DiagonalDivider';
import { BookingProgress } from '@/components/ui/BookingProgress';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { HeroSection } from '@/components/public/HeroSection';
import { StatsBar } from '@/components/public/StatsBar';
import { AboutSection } from '@/components/public/AboutSection';
import { FooterSection } from '@/components/public/FooterSection';
import { GiftVoucherCTA } from '@/components/public/GiftVoucherCTA';
import { PartnerClubCard } from '@/components/public/PartnerClubCard';

// Redesigned booking components
import { ServicePicker } from '@/components/booking/ServicePicker';
import { WeeklyCalendar } from '@/components/booking/WeeklyCalendar';
import { BookingForm, type BookingFormValues } from '@/components/booking/BookingForm';
import { PackagePicker } from '@/components/packages/PackagePicker';

import { LoadingSpinner } from '@/components/guards/LoadingSpinner';

function TenantContent({ slug }: { slug: string }) {
  const { tenant, trainers, services, loading, error } = useTenant();
  const trainer = trainers[0] ?? null;

  // Booking state
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ComputedSlot | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Section refs for smooth scroll
  const bookingRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const current = selectedService ?? services[0] ?? null;

  const { weekly, exceptions } = useAvailability(trainer?.id ?? null);
  const { bookings } = useBookings(trainer?.id ?? null, [
    'confirmed',
    'pending_payment',
  ]);

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

  // Booking step
  const bookingStep: 1 | 2 | 3 = selectedSlot
    ? 3
    : current
      ? 2
      : 1;

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleServiceSelect = (s: Service) => {
    setSelectedService(s);
    setSelectedSlot(null);
    setTimeout(() => scrollTo(calendarRef), 100);
  };

  const handleSlotSelect = (slot: ComputedSlot) => {
    setSelectedSlot(slot);
    setTimeout(() => scrollTo(formRef), 100);
  };

  const handleBookingSubmit = async (values: BookingFormValues) => {
    if (!current || !selectedSlot || !trainer || !tenant) return;
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
      setBookingError('Wystapil blad. Sprobuj ponownie.');
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50 font-display text-xl uppercase tracking-wider">
        {error ?? 'Nie znaleziono'}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NoiseTexture />

      {/* 1. HERO */}
      <HeroSection
        tenant={tenant}
        trainer={trainer}
        onBookClick={() => scrollTo(bookingRef)}
        onAboutClick={() => scrollTo(aboutRef)}
      />

      {/* 2. STATS */}
      <StatsBar />

      {/* 3. DIAGONAL → O MNIE */}
      <DiagonalDivider fromColor="#0a0a0a" toColor="#0b0b0b" />
      <div ref={aboutRef}>
        <AboutSection />
      </div>

      {/* 4. DIAGONAL → TRENINGI (ServicePicker is now a full section) */}
      <DiagonalDivider fromColor="#0b0b0b" toColor="#0d0d0d" flip />
      <div ref={bookingRef}>
        <ServicePicker
          services={services}
          selectedId={(selectedService ?? current)?.id ?? null}
          onSelect={handleServiceSelect}
        />
      </div>

      {/* 5. REZERWACJA — Calendar + Form */}
      <section id="booking" className="bg-[#0b0b0b] py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <AnimatedSection direction="left">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-500/70 mb-3">
              Rezerwacja online
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold uppercase tracking-tight text-white">
              Termin w{' '}
              <span className="text-gradient-brand">60 sekund</span>
            </h2>
            <p className="mt-3 text-sm text-white/50 max-w-lg leading-relaxed normal-case tracking-normal">
              Wybierz trening, kliknij termin, wpisz dane. Bez dzwonienia,
              bez czekania. Potwierdzenie na email natychmiast.
            </p>
          </AnimatedSection>

          <div className="mt-8">
            <BookingProgress currentStep={bookingStep} />
          </div>

          {/* Calendar */}
          {current && (
            <div ref={calendarRef} className="mt-10">
              <AnimatedSection>
                <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-4">
                  Krok 2 &mdash; Wybierz termin ({current.name})
                </h3>
                <WeeklyCalendar
                  slots={slots}
                  selectedSlot={selectedSlot}
                  onSelect={handleSlotSelect}
                />
              </AnimatedSection>
            </div>
          )}

          {/* Form */}
          {current && selectedSlot && (
            <div ref={formRef} className="mt-10">
              {bookingError && (
                <div className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3">
                  {bookingError}
                </div>
              )}
              <BookingForm
                service={current}
                selectedSlot={selectedSlot}
                submitting={submitting}
                onSubmit={handleBookingSubmit}
              />
            </div>
          )}
        </div>
      </section>

      {/* 6. DIAGONAL → PAKIETY */}
      <DiagonalDivider fromColor="#0b0b0b" toColor="#0d0d0d" />
      {trainer && services.length > 0 && (
        <PackagePicker
          tenantId={tenant.id}
          trainerId={trainer.id}
          services={services}
        />
      )}

      {/* 7. MMA KROSNO */}
      {tenant.partnerClub && <PartnerClubCard club={tenant.partnerClub} />}

      {/* 8. VOUCHER */}
      <GiftVoucherCTA tenantSlug={slug} />

      {/* 9. FOOTER */}
      <FooterSection onBookClick={() => scrollTo(bookingRef)} />
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
