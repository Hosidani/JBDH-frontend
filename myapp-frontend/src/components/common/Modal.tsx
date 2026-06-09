import React from 'react';
import { Heading } from '../ui/Heading';
import { useDraggable } from '../../hooks/useDraggable';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, maxWidth = 'max-w-md' }) => {
  const { position, dialogRef, onHeaderMouseDown } = useDraggable(open);

  if (!open) return null;

  const isDragged = position !== null;

  return (
    <div className={`fixed inset-0 z-50 ${isDragged ? '' : 'flex items-center justify-center'}`}>
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
      <div
        ref={dialogRef}
        className={`relative bg-white rounded-2xl shadow-xl w-full ${maxWidth} z-10 flex flex-col max-h-[90vh] ${isDragged ? '' : 'mx-4'}`}
        style={isDragged ? { position: 'absolute', left: position.x, top: position.y } : {}}
      >
        {title && (
          <div
            className="flex items-center justify-between px-8 pt-8 pb-6 shrink-0 cursor-grab select-none active:cursor-grabbing"
            onMouseDown={onHeaderMouseDown}
          >
            <Heading level={2}>{title}</Heading>
            <button
              onClick={onClose}
              onMouseDown={e => e.stopPropagation()}
              className="text-slate-400 hover:text-slate-600 text-xl leading-none"
              aria-label="Stäng"
            >
              ✕
            </button>
          </div>
        )}
        <div className={`overflow-y-auto px-8 pb-8 ${!title ? 'pt-8' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
};
