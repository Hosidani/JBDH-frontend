import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-full px-6 pt-6 ${className}`}>
      {children}
    </div>
  );
};

export default PageWrapper;
