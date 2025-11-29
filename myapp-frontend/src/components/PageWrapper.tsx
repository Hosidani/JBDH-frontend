import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, className = '' }) => {
  return (
    <div className={`max-w-2xl w-full mx-auto mt-8 ${className}`}>
      {children}
    </div>
  );
};

export default PageWrapper;
