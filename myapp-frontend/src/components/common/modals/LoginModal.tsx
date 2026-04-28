
import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from '../../../hooks/TranslationProvider';
import { ApiService } from '../../../services/ApiService';
import { Icon } from '../../ui/Icon';

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const { login } = useAuth();
  const { tSync } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    const result = await ApiService.loginUser(email, password);
    if (result.user) {
      login(result.user);
      onClose();
    } else {
      setError(tSync('loginModal_error_invalid_credentials'));
    }
    setLoading(false);
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
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={tSync('loginModal_password_placeholder')}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-md px-4 py-3 pr-11 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={20} />
            </button>
          </div>
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
