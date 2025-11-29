
import React from 'react';

interface PageBackgroundProps {
  imageUrl: string;
  opacity?: number;
  blur?: number;
  topOffset?: string;
  className?: string;
}

const PageBackground: React.FC<PageBackgroundProps> = ({
  imageUrl,
  opacity = 0.18,
  blur = 1,
  topOffset = '100px',
  className = '',
}) => (
  <div
    aria-hidden="true"
    className={`fixed left-0 right-0 bottom-0 z-0 bg-cover bg-center w-full pointer-events-none ${className}`}
    style={{
      top: topOffset,
      height: `calc(100vh - ${topOffset})`,
      position: 'fixed',
      backgroundImage: `url(${imageUrl})`,
      opacity,
      filter: `blur(${blur}px)`,
      objectFit: 'cover',
    }}
  />
);

export default PageBackground;