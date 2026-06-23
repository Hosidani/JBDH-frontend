import { Navigate } from 'react-router-dom';
import { useLocalAccountContext } from '../../context/LocalAccountContext';
import type { ReactNode } from 'react';

export function RequireLocalAccount({ children }: { children: ReactNode }) {
  const { hasLocalAccount } = useLocalAccountContext();

  // Still loading from IndexDB — render nothing to avoid flash
  if (hasLocalAccount === null) return null;

  if (!hasLocalAccount) return <Navigate to="/" replace />;

  return <>{children}</>;
}
