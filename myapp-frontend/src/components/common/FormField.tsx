import React from 'react';

interface FormFieldProps {
  label: string;
  helpText?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, helpText, error, children, className = '' }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-sm font-medium text-slate-700">{label}</label>
    {children}
    {helpText && <p className="text-xs text-slate-500 font-normal">{helpText}</p>}
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);
