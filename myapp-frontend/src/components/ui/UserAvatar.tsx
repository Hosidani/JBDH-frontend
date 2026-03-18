import React from 'react';

function getInitials(name?: string): string {
  if (!name || name.trim() === '') return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface UserAvatarProps {
  name?: string;
  size?: 'sm' | 'lg';
  className?: string;
  onClick?: () => void;
  title?: string;
}

const sizeClasses = {
  sm: 'w-9 h-9 text-base',
  lg: 'w-24 h-24 text-3xl',
};

const UserAvatar: React.FC<UserAvatarProps> = ({ name, size = 'sm', className = '', onClick, title }) => (
  <div
    className={`rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 ${sizeClasses[size]} ${className}`}
    onClick={onClick}
    title={title}
  >
    {getInitials(name)}
  </div>
);

export default UserAvatar;
