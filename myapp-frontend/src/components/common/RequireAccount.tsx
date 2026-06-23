import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface RequireAccountProps {
  children: React.ReactNode;
}

export const RequireAccount: React.FC<RequireAccountProps> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('requireAccount'));
      // Go back to the page the user came from so the background doesn't change.
      // Fall back to / only if there's no history to return to.
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/', { replace: true });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;
  return <>{children}</>;
};
