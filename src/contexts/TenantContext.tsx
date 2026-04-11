import { createContext, useEffect, useState, type ReactNode } from 'react';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import type { Tenant, TrainerProfile, Service } from '@bookingapp/shared-types';
import { db } from '@/lib/firebase';

export interface TenantContextState {
  tenant: Tenant | null;
  trainers: TrainerProfile[];
  services: Service[];
  loading: boolean;
  error: string | null;
}

// eslint-disable-next-line react-refresh/only-export-components
export const TenantContext = createContext<TenantContextState | null>(null);

export function TenantProvider({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const tSnap = await getDocs(
          query(collection(db, 'tenants'), where('slug', '==', slug), limit(1))
        );
        if (cancelled) return;
        if (tSnap.empty) {
          setError('Tenant nie znaleziony');
          setLoading(false);
          return;
        }
        const tDoc = tSnap.docs[0];
        const tenantData = { id: tDoc.id, ...tDoc.data() } as Tenant;
        setTenant(tenantData);

        const [trainersSnap, servicesSnap] = await Promise.all([
          getDocs(
            query(
              collection(db, 'trainers'),
              where('tenantId', '==', tenantData.id),
              where('active', '==', true)
            )
          ),
          getDocs(
            query(
              collection(db, 'services'),
              where('tenantId', '==', tenantData.id),
              where('active', '==', true)
            )
          ),
        ]);
        if (cancelled) return;

        setTrainers(
          trainersSnap.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as TrainerProfile
          )
        );
        setServices(
          servicesSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Service)
        );
      } catch (e) {
        if (!cancelled) {
          console.error('TenantContext load error', e);
          setError('Blad ladowania tenanta');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <TenantContext.Provider value={{ tenant, trainers, services, loading, error }}>
      {children}
    </TenantContext.Provider>
  );
}
