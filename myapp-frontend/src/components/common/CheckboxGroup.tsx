import type { ReactNode } from 'react';

export interface CheckboxOption {
  value: string;
  label: string | ReactNode;
}

interface CheckboxGroupProps {
  /** All available options */
  options: CheckboxOption[];
  /** Currently selected values */
  selected: string[];
  /** Called with the full new selected array after a toggle */
  onChange: (newSelected: string[]) => void;
  /** Lay items out vertically instead of horizontally */
  vertical?: boolean;
}

function OutlinedCheckbox({ label, checked, onChange }: { label: string | ReactNode; checked: boolean; onChange: () => void }) {
  return (
    <label
      className={`flex flex-row items-center gap-0 px-4 py-2 border-2 rounded-xl cursor-pointer text-base font-semibold transition-all duration-150 min-w-[110px] min-h-[48px] bg-white
        ${checked ? 'border-slate-400' : 'border-slate-200'}
        hover:border-slate-400`}
      style={{ boxShadow: checked ? '0 0 0 2px #64748b' : undefined }}
    >
      <span
        className={`w-5 h-5 border-2 rounded-md flex items-center justify-center mb-1 mt-1 mr-2 flex-shrink-0 ${checked ? 'border-slate-700 bg-white' : 'border-slate-300 bg-white'}`}
        style={{ fontWeight: 700 }}
      >
        {checked && <span className="text-lg leading-none text-slate-700">&#10005;</span>}
      </span>
      <span className="text-slate-700 text-sm font-semibold">{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
    </label>
  );
}

export function CheckboxGroup({ options, selected, onChange, vertical = false }: CheckboxGroupProps) {
  const handleToggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value];
    onChange(next);
  };

  return (
    <div className={`flex ${vertical ? 'flex-col' : 'flex-row flex-wrap'} gap-2`}>
      {options.map(opt => (
        <OutlinedCheckbox
          key={opt.value}
          label={opt.label}
          checked={selected.includes(opt.value)}
          onChange={() => handleToggle(opt.value)}
        />
      ))}
    </div>
  );
}
