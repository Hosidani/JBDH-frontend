import React from 'react';

const PILL_COLORS = [
  { bg: '#ffd42a', text: '#7a5200' },
  { bg: '#bcd35f', text: '#3a5000' },
  { bg: '#5599ff', text: '#ffffff' },
  { bg: '#e88eff', text: '#5c007a' },
  { bg: '#ff61a0', text: '#7a0038' },
  { bg: '#80ffb3', text: '#005c30' },
  { bg: '#87cdde', text: '#1a4a5a' },
  { bg: '#ff7f2a', text: '#7a2e00' },
  { bg: '#95f1f1', text: '#005a5a' },
];

export function getInitials(title: string): string {
  const words = title.trim().split(/\s+/);
  const a = words[0]?.[0] ?? '';
  const b = words[1]?.[0] ?? '';
  return (a + b).toUpperCase();
}

export function getPillColor(id: number) {
  return PILL_COLORS[id % PILL_COLORS.length];
}

interface NamePillProps {
  id: number;
  title: string;
  size?: 'sm' | 'md';
  onClick?: () => void;
}

export const NamePill: React.FC<NamePillProps> = ({ id, title, size = 'md', onClick }) => {
  const { bg, text } = getPillColor(id);
  const initials = getInitials(title);

  const sizeClass = size === 'sm'
    ? 'text-xs font-bold px-1.5 py-0.5 min-w-[28px] h-[22px]'
    : 'text-xs font-bold px-2 py-1 min-w-[34px] h-[26px]';

  return (
    <span
      title={title}
      onClick={onClick}
      style={{ backgroundColor: bg, color: text }}
      className={`inline-flex items-center justify-center rounded-full select-none ${sizeClass} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
    >
      {initials}
    </span>
  );
};
