import React from 'react';

export interface CheckboxOption {
  value: string;
  label: string;
}

interface CheckboxGroupProps {
  options: CheckboxOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  layout?: 'row' | 'column';
  label?: string;
  helpText?: string;
}

const OutlinedCheckbox = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <label
    className={`flex flex-row items-center gap-2 px-2 py-1 border-2 rounded-xl cursor-pointer text-sm font-semibold transition-all duration-150 min-w-[90px] min-h-[32px] bg-white
      ${checked ? 'border-slate-400' : 'border-slate-200'}
      hover:border-slate-400`}
    style={{ boxShadow: checked ? '0 0 0 2px #64748b' : undefined }}
  >
    <span
      className={`w-5 h-5 border-2 rounded-md flex items-center justify-center flex-shrink-0 ${checked ? 'border-slate-700' : 'border-slate-300'}`}
    >
      {checked && <span className="text-lg leading-none text-slate-700">&#10005;</span>}
    </span>
    <span className="text-slate-700">{label}</span>
    <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
  </label>
);

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  selected,
  onChange,
  layout = 'row',
  label,
  helpText,
}) => {
  const handleToggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
      {helpText && <p className="text-xs text-slate-500 font-normal">{helpText}</p>}
      <div className={`flex ${layout === 'column' ? 'flex-col' : 'flex-row flex-wrap'} gap-2`}>
        {options.map(opt => (
          <OutlinedCheckbox
            key={opt.value}
            label={opt.label}
            checked={selected.includes(opt.value)}
            onChange={() => handleToggle(opt.value)}
          />
        ))}
      </div>
    </div>
  );
};
