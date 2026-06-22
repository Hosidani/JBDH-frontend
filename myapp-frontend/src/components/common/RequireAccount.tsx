import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface RequireAccountProps {
  children: React.ReactNode;
}

export const RequireAccount: React.FC<RequireAccountProps> = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('requireAccount'));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};
