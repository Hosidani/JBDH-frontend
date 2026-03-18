import React from 'react';

interface TextAreaProps {
  label?: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  error?: string;
  rows?: number;
  className?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  value,
  onChange,
  readOnly = false,
  placeholder,
  error,
  rows = 4,
  className = '',
}) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
    {readOnly ? (
      <div className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 text-sm whitespace-pre-wrap">
        {value || <span className="text-slate-400">{placeholder}</span>}
      </div>
    ) : (
      <textarea
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
      />
    )}
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);
