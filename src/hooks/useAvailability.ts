import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import type {
  Availability,
  AvailabilityException,
} from '@bookingapp/shared-types';
import { db } from '@/lib/firebase';

export interface AvailabilityData {
  weekly: Availability[];
  exceptions: AvailabilityException[];
  loading: boolean;
  error: string | null;
}

export function useAvailability(trainerId: string | null): AvailabilityData {
  const [weekly, setWeekly] = useState<Availability[]>([]);
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trainerId) {
      setWeekly([]);
      setExceptions([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [weeklySnap, exSnap] = await Promise.all([
          getDocs(
            query(
              collection(db, 'availability'),
              where('trainerId', '==', trainerId)
            )
          ),
          getDocs(
            query(
              collection(db, 'availabilityExceptions'),
              where('trainerId', '==', trainerId)
            )
          ),
        ]);
        if (cancelled) return;
        setWeekly(
          weeklySnap.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as Availability
          )
        );
        setExceptions(
          exSnap.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as AvailabilityException
          )
        );
      } catch (e) {
        if (!cancelled) {
          console.error('useAvailability error', e);
          setError('Blad ladowania dostepnosci');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [trainerId]);

  return { weekly, exceptions, loading, error };
}
