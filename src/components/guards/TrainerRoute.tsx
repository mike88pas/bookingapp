import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from './LoadingSpinner';

export function TrainerRoute({ children }: { children: ReactNode }) {
  const { user, role, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  const allowed =
    role === 'trainer' || role === 'tenant_admin' || role === 'super_admin';
  if (!allowed) return <Navigate to="/" replace />;

  return <>{children}</>;
}
