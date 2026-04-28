import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRoles } from '../../hooks/useRoles';

interface RequireAuthProps {
  /**
   * If provided, the user must have at least one of these roles in addition to being logged in.
   * Omit (or pass undefined) to require only authentication.
   */
  roles?: string[];
  children: React.ReactNode;
}

/**
 * Route guard — redirects to "/" when:
 *   - user is not logged in, OR
 *   - roles are provided and the user has none of them
 *
 * While roles are still loading (user.roles === undefined), renders null to
 * avoid a false redirect before the account-settings fetch completes.
 *
 * Usage in App.tsx:
 *   <Route path="/profile"    element={<RequireAuth><ProfilePage /></RequireAuth>} />
 *   <Route path="/add-job-ad" element={<RequireAuth roles={['Recruiter']}><AddJobAdPage /></RequireAuth>} />
 */
export const RequireAuth: React.FC<RequireAuthProps> = ({ roles, children }) => {
  const { user } = useAuth();
  const { hasAnyRole } = useRoles();

  useEffect(() => {
    if (!user) window.dispatchEvent(new CustomEvent('requireLogin'));
  }, [user]);

  if (!user) return null;

  if (roles && roles.length > 0) {
    if (user.roles === undefined) return null; // roles still loading — don't redirect yet
    if (!hasAnyRole(roles)) return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
