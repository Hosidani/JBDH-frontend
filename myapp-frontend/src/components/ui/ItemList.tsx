import React from 'react';

type ItemListColor = 'blue' | 'green' | 'purple' | 'slate' | 'yellow' | 'red';

type ItemListItem = string | { label: string; sublabel?: string };

interface ItemListProps {
  items: ItemListItem[];
  variant: 'pills' | 'bullets';
  color?: ItemListColor;
}

const pillColors: Record<ItemListColor, string> = {
  blue:   'bg-blue-100 text-blue-800 border border-blue-200',
  green:  'bg-green-100 text-green-800 border border-green-200',
  purple: 'bg-purple-100 text-purple-800 border border-purple-200',
  slate:  'bg-slate-100 text-slate-700 border border-slate-200',
  yellow: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  red:    'bg-red-100 text-red-800 border border-red-200',
};

const dotColors: Record<ItemListColor, string> = {
  blue:   'bg-blue-400',
  green:  'bg-green-400',
  purple: 'bg-purple-400',
  slate:  'bg-slate-400',
  yellow: 'bg-yellow-400',
  red:    'bg-red-400',
};

export const ItemList: React.FC<ItemListProps> = ({ items, variant, color = 'slate' }) => {
  if (variant === 'pills') {
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => {
          const label = typeof item === 'string' ? item : item.label;
          return (
            <span key={idx} className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${pillColors[color]}`}>
              {label}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {items.map((item, idx) => {
        const label = typeof item === 'string' ? item : item.label;
        const sublabel = typeof item === 'string' ? undefined : item.sublabel;
        return (
          <li key={idx} className="text-slate-700 text-sm flex items-center">
            <span className={`inline-block w-2 h-2 rounded-full mr-2 shrink-0 ${dotColors[color]}`} />
            <span>{label}</span>
            {sublabel && <span className="text-slate-400 ml-2">({sublabel})</span>}
          </li>
        );
      })}
    </ul>
  );
};
