import type { Tenant, TrainerProfile } from '@bookingapp/shared-types';

interface TenantHeroProps {
  tenant: Tenant;
  trainer?: TrainerProfile;
}

export function TenantHero({ tenant, trainer }: TenantHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900 via-neutral-900 to-brand-900/40 p-8 md:p-12">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {trainer?.photoUrl && (
          <img
            src={trainer.photoUrl}
            alt={trainer.name}
            className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border border-white/10"
          />
        )}
        <div className="flex-1">
          <div className="text-xs uppercase tracking-widest text-brand-300">
            {trainer?.role ?? tenant.displayName}
          </div>
          <h1 className="mt-1 text-4xl md:text-5xl font-bold text-white">
            {trainer?.name ?? tenant.displayName}
          </h1>
          {trainer?.bio && (
            <p className="mt-4 text-white/70 max-w-2xl">{trainer.bio}</p>
          )}
          {trainer?.specializations && trainer.specializations.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {trainer.specializations.map((s) => (
                <span
                  key={s}
                  className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
