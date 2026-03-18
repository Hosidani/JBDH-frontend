import React from 'react';

interface ToggleProps {
  label?: string;
  checked: boolean;
  onChange: () => void;
  yesLabel?: string;
  noLabel?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  checked,
  onChange,
  yesLabel = 'Ja',
  noLabel = 'Nej',
  disabled = false,
}) => (
  <div className="flex flex-col items-center gap-1 min-w-[70px]">
    {label && <span className="font-semibold text-slate-700 text-xs mb-1">{label}</span>}
    <div className="flex items-center gap-1">
      <span className={`text-xs font-bold ${!checked ? 'text-slate-700' : 'text-slate-400'}`}>{noLabel}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 transition-colors duration-200 peer-disabled:opacity-50" />
        <div className={`dot absolute left-1 top-1 bg-white w-3 h-3 rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
      </label>
      <span className={`text-xs font-bold ${checked ? 'text-slate-700' : 'text-slate-400'}`}>{yesLabel}</span>
    </div>
  </div>
);
