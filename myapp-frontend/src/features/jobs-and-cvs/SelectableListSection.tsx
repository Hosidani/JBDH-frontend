import React from 'react';
import { Button } from '../../components/ui/Button';
import { NamePill } from '../../components/common/NamePill';

export interface SelectableItem {
  id: number;
  name: string;
}

interface SelectableListSectionProps {
  title: string;
  items: SelectableItem[];
  selected: Set<number>;
  onSelectionChange: (selected: Set<number>) => void;
  onAdd: () => void;
  onDelete: () => void;
  addLabel: string;
  deleteLabel: string;
  showPill?: boolean;
}

const SelectableListSection: React.FC<SelectableListSectionProps> = ({
  title,
  items,
  selected,
  onSelectionChange,
  onAdd,
  onDelete,
  addLabel,
  deleteLabel,
  showPill = false,
}) => {
  const allChecked = items.length > 0 && items.every(i => selected.has(i.id));

  const toggleAll = () => {
    if (allChecked) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(items.map(i => i.id)));
    }
  };

  const toggleItem = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectionChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-bold text-base text-slate-800">{title}</h2>
      <div className="border border-slate-200 rounded-lg bg-white flex flex-col" style={{ minHeight: 160 }}>
        {/* Select all row */}
        <label className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={toggleAll}
            className="accent-blue-600"
          />
          <span className="text-sm text-slate-600 font-medium">
            {title === 'Sparade CV' ? 'Alla CV' : 'Alla jobb'}
          </span>
        </label>

        {/* Scrollable list */}
        <div className="overflow-y-auto flex-1" style={{ maxHeight: 200 }}>
          {items.length === 0 ? (
            <p className="text-sm text-slate-400 px-3 py-4 text-center">Inga sparade</p>
          ) : (
            items.map(item => (
              <label
                key={item.id}
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  onChange={() => toggleItem(item.id)}
                  className="accent-blue-600"
                />
                {showPill && (
                  <NamePill id={item.id} title={item.name} size="sm" />
                )}
                <span className="text-sm text-slate-700 truncate">{item.name}</span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button variant="primary" size="sm" onClick={onAdd}>
          {addLabel}
        </Button>
        <Button
          variant="danger"
          size="sm"
          disabled={selected.size === 0}
          onClick={onDelete}
        >
          {deleteLabel}
        </Button>
      </div>
    </div>
  );
};

export default SelectableListSection;
