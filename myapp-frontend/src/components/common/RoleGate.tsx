import type { ReactNode } from 'react';
import { useRoles } from '../../hooks/useRoles';

interface RoleGateProps {
  /** Show content if the user has ANY of these roles. Empty array = visible to all logged-in users. */
  roles: string[];
  children: ReactNode;
  /** Render children as visually disabled instead of hiding them entirely. */
  mode?: 'hide' | 'disable';
  /** Content to render when access is denied (only used with mode="hide"). */
  fallback?: ReactNode;
}

export function RoleGate({ roles: required, children, mode = 'hide', fallback = null }: RoleGateProps) {
  const { hasAnyRole } = useRoles();

  const allowed = required.length === 0 || hasAnyRole(required);

  if (!allowed) {
    if (mode === 'disable') {
      return (
        <div className="pointer-events-none opacity-40 select-none" aria-disabled="true">
          {children}
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
