import React from 'react';
import { Modal } from './Modal';
import { Button } from '../ui/Button';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, loading,
}) => (
  <Modal open={open} onClose={onCancel} title={title}>
    <p className="text-slate-600 text-sm mb-6">{message}</p>
    <div className="flex gap-3 justify-end">
      <Button variant="secondary" disabled={loading} onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button variant="danger" loading={loading} onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </div>
  </Modal>
);
