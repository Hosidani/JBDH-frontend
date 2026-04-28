import React, { useState } from 'react';
import { Icon } from './Icon';

interface TextInputProps {
  label?: string;
  helpText?: string;
  value: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  readOnly?: boolean;
  placeholder?: string;
  error?: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'number';
  className?: string;
  showToggle?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  helpText,
  value,
  onChange,
  onBlur,
  readOnly = false,
  placeholder,
  error,
  type = 'text',
  className = '',
  showToggle = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const resolvedType = type === 'password' && showToggle && showPassword ? 'text' : type;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      {readOnly ? (
        <div className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 text-sm">
          {value || <span className="text-slate-400">{placeholder}</span>}
        </div>
      ) : (
        <div className="relative">
          <input
            type={resolvedType}
            value={value}
            onChange={e => onChange?.(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500${type === 'password' && showToggle ? ' pr-9' : ''}`}
          />
          {type === 'password' && showToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={20} />
            </button>
          )}
        </div>
      )}
      {helpText && <p className="text-xs text-slate-500 font-normal">{helpText}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};
