import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useLocalAccountContext } from '../../context/LocalAccountContext';
import { useRoles } from '../../hooks/useRoles';

interface Props {
  /** BE-format role names. At least one must match. */
  roles: string[];
  children: ReactNode;
}

/**
 * Route guard that checks roles for both local-only and BE-authenticated users.
 * - No local account → redirect to /
 * - BE logged in → use BE roles (via useRoles)
 * - Local-only → use localRoles from LocalAccountContext (stored in IDB)
 */
export function RequireLocalRole({ roles, children }: Props) {
  const { hasLocalAccount, localRoles } = useLocalAccountContext();
  const { isLoggedIn, hasAnyRole } = useRoles();

  if (hasLocalAccount === null) return null;
  if (!hasLocalAccount) return <Navigate to="/" replace />;

  const hasAccess = localRoles.some(r => roles.includes(r)) || (isLoggedIn && hasAnyRole(roles));
  if (!hasAccess) return <Navigate to="/" replace />;

  return <>{children}</>;
}
