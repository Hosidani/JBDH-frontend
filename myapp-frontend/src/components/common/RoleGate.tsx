import React from 'react';
import { useRoles } from '../../hooks/useRoles';

interface RoleGateProps {
  /**
   * Roles that grant access. ANY match is sufficient.
   * - roles={['Recruiter']}  → visible only to recruiters
   * - roles={[]}             → visible to all authenticated users
   */
  roles: string[];
  /**
   * 'hide'    (default) — renders null (or fallback) when access is denied.
   * 'disable'           — renders children with pointer-events-none + opacity-40.
   */
  mode?: 'hide' | 'disable';
  /** Rendered in place of children when mode='hide' and access is denied. */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Declarative role gate. See Coding_guidelines.md § Role-Based UI Gating.
 */
export const RoleGate: React.FC<RoleGateProps> = ({
  roles,
  mode = 'hide',
  fallback = null,
  children,
}) => {
  const { hasAnyRole, isLoggedIn } = useRoles();

  // roles=[] means "any logged-in user"; roles=[...] means "must have one of these"
  const hasAccess = roles.length === 0 ? isLoggedIn : hasAnyRole(roles);

  if (!hasAccess) {
    if (mode === 'disable') {
      return (
        <div className="pointer-events-none opacity-40 cursor-not-allowed select-none">
          {children}
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
