import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-[760px] max-w-full mx-auto mt-8 px-4 ${className}`}>
      {children}
    </div>
  );
};

export default PageWrapper;
