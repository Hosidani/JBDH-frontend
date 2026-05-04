import React, { useState } from 'react';
import { Modal } from '../../components/common';
import { Button } from '../../components/ui/Button';
import { ApiService } from '../../services/ApiService';
import { useTranslation } from '../../hooks/TranslationProvider';

interface AddJobModalProps {
  open: boolean;
  onClose: () => void;
  onAdded: (item: { id: number; name: string; text: string; created_at: string }) => void;
  onUpdated?: (item: { id: number; name: string; text: string }) => void;
  editItem?: { id: number; name: string; text: string };
}

const AddJobModal: React.FC<AddJobModalProps> = ({ open, onClose, onAdded, onUpdated, editItem }) => {
  const { tSync } = useTranslation();
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!editItem;

  React.useEffect(() => {
    if (open) {
      setText(editItem?.text ?? '');
      setName(editItem?.name ?? '');
      setError(null);
    }
  }, [open, editItem]);

  const handleClose = () => {
    setText('');
    setName('');
    setError(null);
    onClose();
  };

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (isEdit && editItem) {
        const updated = await ApiService.updateExternalJobAd(editItem.id, text.trim(), name.trim() || undefined);
        onUpdated?.({ id: updated.id, name: updated.name, text: updated.text });
      } else {
        const created = await ApiService.createExternalJobAd(text.trim(), name.trim() || undefined);
        onAdded(created);
      }
      handleClose();
    } catch {
      setError(tSync('jac_add_job_error'));
    } finally {
      setSaving(false);
    }
  };

  const modalTitle = isEdit ? tSync('jac_edit_job_title') : tSync('jac_add_job_title');

  return (
    <Modal open={open} onClose={handleClose} title={modalTitle}>
      <div className="flex flex-col gap-4">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={tSync('jac_add_job_placeholder')}
          rows={8}
          className="border border-slate-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={tSync('jac_add_job_name_placeholder')}
          className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="lg" onClick={handleClose}>{tSync('jac_modal_cancel')}</Button>
          <Button variant="primary" size="lg" disabled={!text.trim()} loading={saving} onClick={handleSave}>
            {isEdit ? tSync('jac_edit_job_save') : tSync('jac_add_job_save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddJobModal;
