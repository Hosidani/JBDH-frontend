import React from 'react';
import { Heading } from '../ui/Heading';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4 z-10">
        {title && (
          <div className="flex items-center justify-between mb-6">
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
        {children}
      </div>
    </div>
  );
};
