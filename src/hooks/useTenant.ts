import { useContext } from 'react';
import { TenantContext, type TenantContextState } from '@/contexts/TenantContext';

export function useTenant(): TenantContextState {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error('useTenant musi byc uzyty wewnatrz <TenantProvider>');
  }
  return ctx;
}
