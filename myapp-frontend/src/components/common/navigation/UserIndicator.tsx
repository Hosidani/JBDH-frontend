import React, { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { UserAvatar } from '../../ui';

const UserIndicator: React.FC = () => {
  const ctx = useContext(AuthContext);
  if (!ctx || !ctx.user) return null;
  const { user } = ctx;
  return (
    <div className="flex items-center ml-4">
      <UserAvatar
        name={user.name}
        size="sm"
        className="cursor-pointer shadow-sm hover:ring-2 hover:ring-slate-400 transition"
        onClick={() => window.dispatchEvent(new CustomEvent('sessionExpired'))}
        title={`${user.name || 'Namn Saknas'} — [TEST] Klicka för att simulera utloggning`}
      />
    </div>
  );
};

export default UserIndicator;
