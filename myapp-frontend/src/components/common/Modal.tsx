import React from 'react';
import { Heading } from '../ui/Heading';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, maxWidth = 'max-w-md' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-xl w-full ${maxWidth} mx-4 z-10 flex flex-col max-h-[90vh]`}>
        {title && (
          <div className="flex items-center justify-between px-8 pt-8 pb-6 shrink-0">
            <Heading level={2}>{title}</Heading>
            <button
              onClick={onClose}
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
