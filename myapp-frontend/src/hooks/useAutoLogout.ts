import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function useAutoLogout() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('access_token');
      if (!isTokenValid(token)) {
        localStorage.removeItem('access_token');
        navigate('/login');
      }
    };

    checkToken();
    const interval = setInterval(checkToken, 60 * 1000); // check every minute

    return () => clearInterval(interval);
  }, [navigate]);
}