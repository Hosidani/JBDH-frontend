import React, { useState, useRef, useEffect } from 'react';

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
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = suggestions.filter(
    s => !value || s.toLowerCase().includes(value.toLowerCase()),
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full border border-slate-300 rounded px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setOpen(o => !o)}
          className="absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 hover:text-slate-600"
          aria-label="toggle suggestions"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.map(s => (
            <li
              key={s}
              onMouseDown={e => {
                e.preventDefault();
                onChange(s);
                setOpen(false);
              }}
              className="px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 cursor-pointer"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
