import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-[80%] max-w-full mx-auto mt-8 ${className}`}>
      {children}
    </div>
  );
};

export default PageWrapper;
