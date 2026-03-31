import React from 'react';

interface HeadingProps {
  level: 1 | 2 | 3 | 4;
  children: React.ReactNode;
  className?: string;
}

const levelClasses: Record<number, string> = {
  1: 'text-3xl font-bold text-blue-700',
  2: 'text-2xl font-semibold text-blue-600',
  3: 'text-lg font-semibold text-blue-600',
  4: 'text-base font-semibold text-blue-600',
};

export const Heading: React.FC<HeadingProps> = ({ level, children, className = '' }) => {
  const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
  return <Tag className={`${levelClasses[level]} ${className}`}>{children}</Tag>;
};
