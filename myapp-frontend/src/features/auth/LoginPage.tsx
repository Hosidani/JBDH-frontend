const API_URL = `${import.meta.env.VITE_API_URL}/api`;
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/TranslationProvider';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { tSync } = useTranslation();
  const successMessage = location.state && location.state.success;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/Login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        // Backend does not return user info, treat any 2xx as success
        login({ email });
        navigate('/');
      } else {
        setError(tSync('loginPage_invalid_credentials'));
      }
    } catch (err) {
      setError(tSync('loginPage_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="card">
        <h2 style={{ textAlign: 'center', color: '#2563eb', marginBottom: '1.5rem' }}>{tSync('loginPage_title')}</h2>
        {successMessage && (
          <div style={{ color: '#10b981', marginBottom: '1rem', textAlign: 'center' }}>{successMessage}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: 4 }}>{tSync('loginPage_email_label')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
                className=""
              style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #d1d5db' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: 4 }}>{tSync('loginPage_password_label')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
                className=""
              style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #d1d5db' }}
            />
          </div>
          {error && <div style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: '#2563eb', color: 'white', padding: 10, borderRadius: 4, fontWeight: 600 }}
          >
            {loading ? tSync('loginPage_logging_in') : tSync('loginPage_button')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
