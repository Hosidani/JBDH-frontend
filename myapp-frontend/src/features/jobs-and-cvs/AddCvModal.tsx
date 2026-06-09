import React, { useState } from 'react';
import { Modal } from '../../components/common';
import FileDropZone from '../../components/common/inputs/FileDropZone';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { ApiService } from '../../services/ApiService';
import { useTranslation } from '../../hooks/TranslationProvider';
import { parseCvFile } from '../../utils/parseCvFile';

interface AddCvModalProps {
  open: boolean;
  onClose: () => void;
  onAdded: (item: { id: number; name: string; text: string; created_at: string }) => void;
  onUpdated?: (item: { id: number; name: string; text: string }) => void;
  editItem?: { id: number; name: string };
}

type Step = 'drop' | 'parsing' | 'review';

const AddCvModal: React.FC<AddCvModalProps> = ({ open, onClose, onAdded, onUpdated, editItem }) => {
  const { tSync } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('drop');
  const [cvText, setCvText] = useState('');
  const [consented, setConsented] = useState(false);

  const isEdit = !!editItem;

  React.useEffect(() => {
    if (open) {
      setFile(null);
      setName(editItem?.name ?? '');
      setError(null);
      setStep('drop');
      setCvText('');
      setConsented(false);
    }
  }, [open, editItem]);

  const handleClose = () => {
    setFile(null);
    setName('');
    setError(null);
    setStep('drop');
    setCvText('');
    setConsented(false);
    onClose();
  };

  const handleFileSelected = async (selected: File) => {
    setFile(selected);
    setError(null);
    setStep('parsing');
    try {
      const text = await parseCvFile(selected);
      setCvText(text);
      setStep('review');
    } catch {
      setError(tSync('jac_cv_parse_error'));
      setStep('drop');
    }
  };

  // Edit, name-only save (no new file)
  const handleNameOnlySave = async () => {
    if (!isEdit || !editItem) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await ApiService.updateExternalCVName(editItem.id, name.trim());
      onUpdated?.({ id: updated.id, name: updated.name, text: updated.text });
      handleClose();
    } catch (e) {
      console.error('[AddCvModal] handleNameOnlySave failed:', e);
      setError(tSync('jac_add_cv_error'));
    } finally {
      setSaving(false);
    }
  };

  // Save parsed + reviewed text (both add and edit)
  const handleTextSave = async () => {
    if (!cvText.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (isEdit && editItem) {
        const updated = await ApiService.updateExternalCVText(editItem.id, cvText.trim(), name.trim() || undefined);
        onUpdated?.({ id: updated.id, name: updated.name, text: updated.text });
      } else {
        const created = await ApiService.createExternalCV(cvText.trim(), name.trim() || undefined);
        onAdded(created);
      }
      handleClose();
    } catch (e) {
      console.error('[AddCvModal] handleTextSave failed:', e);
      setError(tSync('jac_add_cv_error'));
    } finally {
      setSaving(false);
    }
  };

  const modalTitle = isEdit ? tSync('jac_edit_cv_title') : tSync('jac_add_cv_title');
  const isReview = step === 'review';
  const nameChanged = name.trim() !== (editItem?.name ?? '').trim();

  return (
    <Modal open={open} onClose={handleClose} title={modalTitle} maxWidth={isReview ? 'max-w-3xl' : 'max-w-md'}>
      {!isReview ? (
        // ── Steg 1: drop-zon ─────────────────────────────────────────────────
        <div className="flex flex-col gap-4">
          <FileDropZone
            onFileSelected={handleFileSelected}
            accept=".pdf,.docx"
            disabled={step === 'parsing'}
            className="p-6 text-center"
          >
            <div className="flex flex-col items-center gap-2 text-slate-500 text-sm">
              {step === 'parsing' ? (
                <span className="text-slate-600">{tSync('jac_cv_parsing')}</span>
              ) : file ? (
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
            disabled={step === 'parsing'}
            className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="lg" disabled={step === 'parsing'} onClick={handleClose}>
              {tSync('jac_modal_cancel')}
            </Button>
            {isEdit && nameChanged && step !== 'parsing' && (
              <Button variant="primary" size="lg" loading={saving} onClick={handleNameOnlySave}>
                {tSync('jac_edit_cv_save')}
              </Button>
            )}
          </div>
        </div>
      ) : (
        // ── Steg 2: granska text ──────────────────────────────────────────────
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            <Icon name="warning" size={22} className="shrink-0 text-yellow-600 mt-0.5" />
            <p>{tSync('jac_cv_review_help')}</p>
          </div>

          <textarea
            value={cvText}
            onChange={e => setCvText(e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-3 text-sm text-slate-700 resize-y focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={18}
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex items-center justify-between gap-4">
            <label className="flex items-start gap-2 cursor-pointer select-none text-sm text-slate-600">
              <input
                type="checkbox"
                checked={consented}
                onChange={e => setConsented(e.target.checked)}
                disabled={saving}
                className="mt-0.5 w-4 h-4 shrink-0 accent-blue-600 cursor-pointer"
              />
              {tSync('jac_cv_consent')}
            </label>
            <div className="flex gap-2 shrink-0">
              <Button variant="ghost" size="lg" disabled={saving} onClick={handleClose}>
                {tSync('jac_modal_cancel')}
              </Button>
              <Button
                variant="primary" size="lg"
                disabled={!cvText.trim() || !consented}
                loading={saving}
                onClick={handleTextSave}
              >
                {isEdit ? tSync('jac_edit_cv_save') : tSync('jac_add_cv_save')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AddCvModal;
