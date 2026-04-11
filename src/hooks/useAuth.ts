import { useContext } from 'react';
import { AuthContext, type AuthState } from '@/contexts/AuthContext';

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth musi byc uzyty wewnatrz <AuthProvider>');
  }
  return ctx;
}
