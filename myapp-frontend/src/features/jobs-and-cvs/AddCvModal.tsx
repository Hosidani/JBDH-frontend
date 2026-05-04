import React, { useState } from 'react';
import { Modal } from '../../components/common';
import FileDropZone from '../../components/common/inputs/FileDropZone';
import { Button } from '../../components/ui/Button';
import { ApiService } from '../../services/ApiService';
import { useTranslation } from '../../hooks/TranslationProvider';

interface AddCvModalProps {
  open: boolean;
  onClose: () => void;
  onAdded: (item: { id: number; name: string; text: string; created_at: string }) => void;
  onUpdated?: (item: { id: number; name: string; text: string }) => void;
  editItem?: { id: number; name: string };
}

const AddCvModal: React.FC<AddCvModalProps> = ({ open, onClose, onAdded, onUpdated, editItem }) => {
  const { tSync } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!editItem;

  React.useEffect(() => {
    if (open) {
      setFile(null);
      setName(editItem?.name ?? '');
      setError(null);
    }
  }, [open, editItem]);

  const handleClose = () => {
    setFile(null);
    setName('');
    setError(null);
    onClose();
  };

  const canSave = isEdit ? (file !== null || name.trim() !== (editItem?.name ?? '').trim()) : file !== null;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      if (isEdit && editItem) {
        let updated: { id: number; name: string; text: string; created_at: string };
        if (file) {
          updated = await ApiService.updateExternalCVPDF(editItem.id, file, name.trim() || undefined);
        } else {
          updated = await ApiService.updateExternalCVName(editItem.id, name.trim());
        }
        onUpdated?.({ id: updated.id, name: updated.name, text: updated.text });
      } else {
        const created = await ApiService.uploadCVPDF(file!, name.trim() || undefined);
        onAdded(created);
      }
      handleClose();
    } catch {
      setError(tSync('jac_add_cv_error'));
    } finally {
      setSaving(false);
    }
  };

  const modalTitle = isEdit ? tSync('jac_edit_cv_title') : tSync('jac_add_cv_title');

  return (
    <Modal open={open} onClose={handleClose} title={modalTitle}>
      <div className="flex flex-col gap-4">
        <FileDropZone
          onFileSelected={setFile}
          accept=".pdf,.docx"
          disabled={saving}
          className="p-6 text-center"
        >
          <div className="flex flex-col items-center gap-2 text-slate-500 text-sm">
            {file ? (
              <span className="text-slate-700 font-medium">{file.name}</span>
            ) : (
              <>
                <span className="text-2xl">📄</span>
                <span>{isEdit ? tSync('jac_edit_cv_dropzone') : tSync('jac_add_cv_dropzone')}</span>
              </>
            )}
          </div>
        </FileDropZone>

        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={tSync('jac_add_cv_name_placeholder')}
          className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="lg" onClick={handleClose}>{tSync('jac_modal_cancel')}</Button>
          <Button variant="primary" size="lg" disabled={!canSave} loading={saving} onClick={handleSave}>
            {isEdit ? tSync('jac_edit_cv_save') : tSync('jac_add_cv_save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddCvModal;
