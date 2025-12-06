import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function getInitials(name?: string) {
  if (!name || name.trim() === '') return 'NS';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const UserIndicator: React.FC = () => {
  const ctx = useContext(AuthContext);
  if (!ctx || !ctx.user) return null;
  const { user } = ctx;
  const initials = getInitials(user.name);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        marginLeft: '1rem',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: '#2563eb',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          fontSize: 18,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
        title={user.name || 'Namn Saknas'}
      >
        {initials}
      </div>
    </div>
  );
};

export default UserIndicator;
