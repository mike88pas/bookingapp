import { createContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { UserRole } from '@bookingapp/shared-types';
import { auth, db } from '@/lib/firebase';

export interface AuthState {
  user: User | null;
  role: UserRole | null;
  tenantId: string | null;
  trainerId: string | null;
  loading: boolean;
  logout: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const roleDoc = await getDoc(doc(db, 'roles', firebaseUser.uid));
          if (roleDoc.exists()) {
            const data = roleDoc.data();
            setRole((data.role as UserRole) ?? null);
            setTenantId(data.tenantId ?? null);
            setTrainerId(data.trainerId ?? null);
          } else {
            setRole(null);
            setTenantId(null);
            setTrainerId(null);
          }
        } catch {
          setRole(null);
          setTenantId(null);
          setTrainerId(null);
        }
      } else {
        setRole(null);
        setTenantId(null);
        setTrainerId(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
    setTenantId(null);
    setTrainerId(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, role, tenantId, trainerId, loading, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
