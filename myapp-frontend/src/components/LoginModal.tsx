import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5071/Login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        // Backend does not return user info, treat any 2xx as success
        login({ email });
        onClose();
      } else {
        setError('Fel e-post eller lösenord.');
      }
    } catch (err) {
      setError('Ett fel uppstod.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-2xl leading-none">&times;</button>
        <div className="text-center font-bold text-xl mb-6">Välkommen</div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input-dark border border-slate-200 rounded-md px-4 py-3 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            required
            autoFocus
          />
          <input
            type="password"
            placeholder="Lösenord"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input-dark border border-slate-200 rounded-md px-4 py-3 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            required
          />
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-md font-semibold text-base mt-2 hover:bg-gray-800 transition"
          >
            {loading ? 'Loggar in...' : 'Logga in'}
          </button>
        </form>
        <div className="text-center text-sm mt-4 text-slate-500">
          Har du inget konto? <a href="/register" className="text-blue-600 hover:underline">Registrera dig</a><br />
          Glömt lösenordet? <a href="#" className="text-blue-600 hover:underline">Sätt ett nytt</a>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
