import React, { useRef, useEffect, useState, useCallback } from 'react';

export interface DataListColumn<T> {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render: (item: T) => React.ReactNode;
}

interface DataListProps<T> {
  items: T[];
  columns: DataListColumn<T>[];
  getItemId: (item: T) => string | number;
  onItemClick?: (item: T) => void;
  selectedId?: string | number;
  pageSize?: number;
  storageKey?: string;
  emptyMessage?: string;
  loading?: boolean;
  maxHeight?: string;
  className?: string;
}

function PaginationBar({
  currentPage,
  totalPages,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const btn = (label: React.ReactNode, page: number, disabled: boolean, active = false) => (
    <button
      key={String(label)}
      onClick={() => !disabled && onChange(page)}
      disabled={disabled}
      className={`px-3 py-1 rounded text-sm font-medium transition
        ${active ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center justify-center gap-1 pt-3 border-t border-slate-100">
      {btn('‹', currentPage - 1, currentPage === 1)}
      {pages.map((p, i) =>
        p === '...'
          ? <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-sm">…</span>
          : btn(p, p, false, p === currentPage)
      )}
      {btn('›', currentPage + 1, currentPage === totalPages)}
    </div>
  );
}

export function DataList<T>({
  items,
  columns,
  getItemId,
  onItemClick,
  selectedId,
  pageSize = 20,
  storageKey,
  emptyMessage = 'Inga poster.',
  loading = false,
  maxHeight = '60vh',
  className = '',
}: DataListProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (storageKey) {
      const saved = sessionStorage.getItem(`${storageKey}_page`);
      return saved ? parseInt(saved) : 1;
    }
    return 1;
  });

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = items.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Restore scroll position after items render
  useEffect(() => {
    if (!storageKey || !scrollRef.current) return;
    const savedScroll = sessionStorage.getItem(`${storageKey}_scroll`);
    if (savedScroll) {
      scrollRef.current.scrollTop = parseInt(savedScroll);
    }
  }, [items, storageKey]);

  // Save scroll position on scroll (debounced)
  const handleScroll = useCallback(() => {
    if (!storageKey || !scrollRef.current) return;
    const scrollTop = scrollRef.current.scrollTop;
    sessionStorage.setItem(`${storageKey}_scroll`, String(scrollTop));
  }, [storageKey]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (storageKey) sessionStorage.setItem(`${storageKey}_page`, String(page));
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10 text-slate-400 text-sm">
        Laddar...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400 text-sm">{emptyMessage}</div>
    );
  }

  return (
    <div className={`flex flex-col gap-0 ${className}`}>
      {/* Sticky column headers */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-auto">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide
                    ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}
                  `}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>

      {/* Scrollable body */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-y-auto overflow-x-auto"
        style={{ maxHeight }}
      >
        <table className="w-full border-collapse table-auto">
          <tbody>
            {pageItems.map(item => {
              const id = getItemId(item);
              const isSelected = id === selectedId;
              return (
                <tr
                  key={id}
                  onClick={() => onItemClick?.(item)}
                  className={`border-b border-slate-100 transition
                    ${onItemClick ? 'cursor-pointer hover:bg-blue-50' : ''}
                    ${isSelected ? 'bg-blue-50' : ''}
                  `}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={`px-3 py-3 text-sm
                        ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}
                      `}
                      style={col.width ? { width: col.width } : undefined}
                      onClick={col.key === '_actions' ? e => e.stopPropagation() : undefined}
                    >
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <PaginationBar currentPage={safePage} totalPages={totalPages} onChange={handlePageChange} />

      {/* Item count */}
      <div className="text-xs text-slate-400 text-right pt-1">
        {items.length} poster · sida {safePage} av {totalPages}
      </div>
    </div>
  );
}

export default DataList;
