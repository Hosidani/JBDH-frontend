import React from 'react';

type BadgeColor = 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'purple';

interface BadgeProps {
  label: string;
  color?: BadgeColor;
  className?: string;
}

const colorClasses: Record<BadgeColor, string> = {
  blue:   'bg-blue-100 text-blue-800 border-blue-200',
  green:  'bg-green-100 text-green-800 border-green-200',
  red:    'bg-red-100 text-red-800 border-red-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  gray:   'bg-slate-100 text-slate-700 border-slate-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
};

export const Badge: React.FC<BadgeProps> = ({ label, color = 'gray', className = '' }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[color]} ${className}`}
  >
    {label}
  </span>
);
