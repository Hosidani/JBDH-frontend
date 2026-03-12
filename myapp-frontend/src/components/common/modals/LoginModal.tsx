import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from '../../../hooks/TranslationProvider';

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  console.log('🔍 LoginModal API_URL:', API_URL);

  const { login } = useAuth();
  const { tSync } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Manual validation
    if (!email.trim() && !password.trim()) {
      setError(tSync('loginModal_error_both_required'));
      return;
    }
    if (!email.trim()) {
      setError(tSync('loginModal_error_email_required'));
      return;
    }
    if (!password.trim()) {
      setError(tSync('loginModal_error_password_required'));
      return;
    }
    if (!email.includes('@')) {
      setError(tSync('loginModal_error_invalid_email'));
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.access && data.refresh) {
          // Spara JWT-tokens i localStorage
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          login(data.user || { email });
          onClose();
        } else {
          setError(tSync('loginModal_error_invalid_credentials') + ': No JWT token returned');
        }
      } else {
        const errorText = await response.text();
        setError(tSync('loginModal_error_invalid_credentials') + (errorText ? `: ${errorText}` : ''));
      }
    } catch (err) {
      setError(tSync('loginModal_error_generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-2xl leading-none">&times;</button>
        <div className="text-center font-bold text-xl mb-6">{tSync('loginModal_title')}</div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder={tSync('loginModal_email_placeholder')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border border-slate-200 rounded-md px-4 py-3 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            required
            autoFocus
          />
          <input
            type="password"
            placeholder={tSync('loginModal_password_placeholder')}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border border-slate-200 rounded-md px-4 py-3 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            required
          />
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-md font-semibold text-base mt-2 hover:bg-gray-800 transition"
          >
            {loading ? tSync('loginModal_logging_in') : tSync('loginModal_button')}
          </button>
        </form>
        <div className="text-center text-sm mt-4 text-slate-500">
          {tSync('loginModal_no_account')} <a href="/register" className="text-blue-600 hover:underline">{tSync('loginModal_register_link')}</a><br />
          {tSync('loginModal_forgot_password')} <a href="#" className="text-blue-600 hover:underline">{tSync('loginModal_reset_password_link')}</a>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
