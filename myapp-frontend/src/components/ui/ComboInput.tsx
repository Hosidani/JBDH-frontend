import React, { useId } from 'react';

interface ComboInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions: string[];
  className?: string;
}

export const ComboInput: React.FC<ComboInputProps> = ({
  value,
  onChange,
  placeholder,
  suggestions,
  className = '',
}) => {
  const listId = useId();
  return (
    <>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        list={listId}
        className={`border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full ${className}`}
      />
      <datalist id={listId}>
        {suggestions.map(s => <option key={s} value={s} />)}
      </datalist>
    </>
  );
};
