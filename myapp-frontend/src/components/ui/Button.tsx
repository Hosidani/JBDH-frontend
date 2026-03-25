import React from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-200 disabled:text-gray-400',
  secondary: 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 focus:ring-blue-500 disabled:text-gray-400 disabled:border-gray-300',
  danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost:     'bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  children,
  className = '',
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    className={`
      inline-flex items-center justify-center font-medium rounded-md
      focus:outline-none focus:ring-2 focus:ring-offset-1
      transition-colors duration-150
      disabled:cursor-not-allowed
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${className}
    `}
  >
    {loading ? <span className="mr-2 animate-spin">⟳</span> : null}
    {children}
  </button>
);
