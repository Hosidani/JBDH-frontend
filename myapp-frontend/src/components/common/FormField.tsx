import React from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, error, children, className = '' }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-sm font-medium text-slate-700">{label}</label>
    {children}
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);
