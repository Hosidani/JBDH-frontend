import React from 'react';
import { Button } from '../../components/ui/Button';
import { NamePill } from '../../components/common/NamePill';
import { Icon } from '../../components/ui/Icon';

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
  selectAllLabel: string;
  emptyLabel: string;
  showPill?: boolean;
  onEdit?: (id: number) => void;
  className?: string;
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
  selectAllLabel,
  emptyLabel,
  showPill = false,
  onEdit,
  className = '',
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
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="border border-slate-200 rounded-lg bg-white flex flex-col flex-1">
        {/* Select all row */}
        <label className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={toggleAll}
            className="accent-blue-600"
          />
          <span className="text-sm text-slate-600 font-medium">{selectAllLabel}</span>
        </label>

        {/* Scrollable list */}
        <div className="overflow-y-auto flex-1" style={{ maxHeight: 200 }}>
          {items.length === 0 ? (
            <p className="text-sm text-slate-400 px-3 py-4 text-center">{emptyLabel}</p>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                className="group flex items-center gap-2 px-3 py-2 hover:bg-blue-50 select-none"
              >
                <input
                  type="checkbox"
                  id={`sel-item-${item.id}`}
                  checked={selected.has(item.id)}
                  onChange={() => toggleItem(item.id)}
                  className="accent-blue-600 cursor-pointer"
                />
                <label
                  htmlFor={`sel-item-${item.id}`}
                  className="flex items-center gap-2 flex-1 text-sm text-slate-700 truncate cursor-pointer"
                >
                  {showPill && (
                    <NamePill id={item.id} title={item.name} size="sm" />
                  )}
                  {item.name}
                </label>
                {onEdit && (
                  <button
                    onClick={e => { e.preventDefault(); onEdit(item.id); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-blue-600 rounded shrink-0"
                    tabIndex={-1}
                    aria-label={`edit-${item.id}`}
                  >
                    <Icon name="edit" size={20} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-auto">
        <Button variant="primary" size="lg" onClick={onAdd}>
          {addLabel}
        </Button>
        <Button
          variant="danger"
          size="lg"
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
