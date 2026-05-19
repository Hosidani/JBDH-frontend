import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}

export function Section({ title, children }: Props) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-blue-700 mb-2">{title}</h3>
      {children}
    </div>
  );
}
