import React from 'react';

const PILL_COLORS = [
  { bg: '#dbeafe', text: '#1e40af' },
  { bg: '#dcfce7', text: '#166534' },
  { bg: '#ede9fe', text: '#5b21b6' },
  { bg: '#ffedd5', text: '#9a3412' },
  { bg: '#fce7f3', text: '#9d174d' },
  { bg: '#ccfbf1', text: '#134e4a' },
  { bg: '#fef9c3', text: '#854d0e' },
  { bg: '#e0e7ff', text: '#3730a3' },
  { bg: '#ffe4e6', text: '#9f1239' },
  { bg: '#cffafe', text: '#155e75' },
  { bg: '#ecfccb', text: '#3f6212' },
  { bg: '#fee2e2', text: '#991b1b' },
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
    ? 'text-xs px-1.5 py-0.5 min-w-[28px] h-[22px]'
    : 'text-xs font-semibold px-2 py-1 min-w-[34px] h-[26px]';

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
