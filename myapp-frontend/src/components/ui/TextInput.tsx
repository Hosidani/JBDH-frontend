import React from 'react';

interface TextInputProps {
  label?: string;
  helpText?: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  error?: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'number';
  className?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  helpText,
  value,
  onChange,
  readOnly = false,
  placeholder,
  error,
  type = 'text',
  className = '',
}) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
    {readOnly ? (
      <div className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 text-sm">
        {value || <span className="text-slate-400">{placeholder}</span>}
      </div>
    ) : (
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    )}
    {helpText && <p className="text-xs text-slate-500 font-normal">{helpText}</p>}
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);
