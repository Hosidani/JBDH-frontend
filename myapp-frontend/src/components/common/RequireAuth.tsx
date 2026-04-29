import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRoles } from '../../hooks/useRoles';

interface RequireAuthProps {
  roles?: string[];
  children: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ roles, children }) => {
  const { user } = useAuth();
  const { hasAnyRole } = useRoles();

  if (!user) return <Navigate to="/" replace />;

  if (roles && roles.length > 0) {
    if (user.roles === undefined) return null; // roles still loading — don't redirect yet
    if (!hasAnyRole(roles)) return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
