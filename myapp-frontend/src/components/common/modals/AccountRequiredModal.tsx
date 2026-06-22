import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../hooks/TranslationProvider';

interface AccountRequiredModalProps {
  onClose: () => void;
}

const AccountRequiredModal: React.FC<AccountRequiredModalProps> = ({ onClose }) => {
  const { tSync } = useTranslation();
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    onClose();
    navigate('/register');
  };

  const handleLogin = () => {
    onClose();
    window.dispatchEvent(new CustomEvent('requireLogin'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-2xl leading-none">&times;</button>
        <div className="text-center font-bold text-xl mb-3">{tSync('account_required_title')}</div>
        <p className="text-sm text-slate-600 text-center mb-6">{tSync('account_required_body')}</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleCreateAccount}
            className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold text-base hover:bg-blue-700 transition"
          >
            {tSync('account_required_create')}
          </button>
          <button
            onClick={handleLogin}
            className="w-full border border-slate-300 text-slate-700 py-3 rounded-md font-semibold text-base hover:bg-slate-50 transition"
          >
            {tSync('account_required_login')}
          </button>
          <button
            onClick={onClose}
            className="w-full text-slate-500 py-2 text-sm hover:underline"
          >
            {tSync('account_required_close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountRequiredModal;
