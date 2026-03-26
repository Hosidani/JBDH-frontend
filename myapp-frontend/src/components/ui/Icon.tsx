import React from 'react';

interface IconProps {
  name: string;
  filled?: boolean;
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, filled = false, size = 20, className = '' }) => (
  <span
    className={`material-symbols-outlined select-none ${className}`}
    style={{ fontSize: size, lineHeight: 1, fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}` }}
  >
    {name}
  </span>
);
