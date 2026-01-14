import React from 'react';
import Modal from 'react-modal';

interface EmailConfirmModalProps {
  isOpen: boolean;
  newEmail: string;
  onConfirm: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onCancel: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const EmailConfirmModal: React.FC<EmailConfirmModalProps> = ({ isOpen, newEmail, onConfirm, onCancel }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onCancel}
      contentLabel="Email Change Confirmation"
      ariaHideApp={false}
      style={{
        overlay: {
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        content: {
          zIndex: 1001,
          position: 'relative',
          maxWidth: 400,
          margin: 'auto',
          padding: 24,
          inset: 'unset',
          borderRadius: 12,
          boxShadow: '0 4px 32px rgba(0,0,0,0.2)',
        },
      }}
    >
      <h3 className="font-semibold mb-2">Confirm Email Change</h3>
      <p>
        Are you sure your new email is: <span className="font-bold">{newEmail}</span>?
      </p>
      <p className="mt-2 text-sm text-red-600">You can't log in with the old one anymore.</p>
      <div className="flex gap-4 mt-6">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition"
          onClick={onConfirm}
        >
          Confirm
        </button>
        <button
          className="bg-gray-300 px-4 py-2 rounded font-semibold hover:bg-gray-400 transition"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default EmailConfirmModal;
