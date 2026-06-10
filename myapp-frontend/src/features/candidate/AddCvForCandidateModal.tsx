import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/common';
import FileDropZone from '../../components/common/inputs/FileDropZone';
import { Button } from '../../components/ui/Button';
import { Toggle } from '../../components/ui/Toggle';
import { useTranslation } from '../../hooks/TranslationProvider';
import { ApiService } from '../../services/ApiService';
import { LocalDbService } from '../../db/LocalDbService';
import type { CV, Candidate } from '../../db/types';

interface Props {
  open: boolean;
  onClose: () => void;
  defaultCandidateId: string;
  candidates: Candidate[];
  editCv?: CV;
  onSaved: (cv: CV) => void;
}

const ACCEPT = '.pdf,.docx,.txt,.rtf,.md';

const AddCvForCandidateModal: React.FC<Props> = ({
  open, onClose, defaultCandidateId, candidates, editCv, onSaved,
}) => {
  const { tSync } = useTranslation();
  const isEdit = !!editCv;

  const [file, setFile] = useState<File | null>(null);
  const [cvTitle, setCvTitle] = useState('');
  const [candidateId, setCandidateId] = useState(defaultCandidateId);
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFile(null);
      setError(null);
      if (editCv) {
        setCvTitle(editCv.cv_title ?? '');
        setCandidateId(editCv.candidate_id);
        setPublished(editCv.cv_published);
      } else {
        setCvTitle('');
        setCandidateId(defaultCandidateId);
        setPublished(false);
      }
    }
  }, [open, editCv, defaultCandidateId]);

  const handleSave = async () => {
    if (!isEdit && !file) { setError(tSync('jac_add_cv_error')); return; }
    setSaving(true);
    setError(null);
    try {
      if (isEdit && editCv) {
        // Edit: update IndexedDB only (file was already uploaded on creation)
        const updated = await LocalDbService.updateCV(editCv.cv_id, {
          cv_title: cvTitle,
          candidate_id: candidateId,
          cv_published: published,
          ...(file ? { cv_file: file, cv_file_type: file.type } : {}),
        });
        onSaved(updated!);
      } else {
        // Add: upload to backend + save to IndexedDB
        await ApiService.uploadCVPDF(file!, cvTitle.trim() || undefined);
        const saved = await LocalDbService.addCV({
          candidate_id: candidateId,
          cv_title: cvTitle.trim() || file!.name,
          cv_anonymized: '',
          cv_json: '',
          cv_file: file,
          cv_file_type: file!.type,
          cv_published: published,
        });
        onSaved(saved);
      }
      onClose();
    } catch {
      setError(tSync('jac_add_cv_error'));
    } finally {
      setSaving(false);
    }
  };

  const modalTitle = isEdit ? tSync('candidate_cv_edit_title') : tSync('candidate_cv_add_title');

  return (
    <Modal open={open} onClose={onClose} title={modalTitle} maxWidth="max-w-md">
      <div className="flex flex-col gap-4">

        {/* Titel på CV */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">{tSync('candidate_cv_field_title')}</label>
          <input
            type="text"
            value={cvTitle}
            onChange={e => setCvTitle(e.target.value)}
            className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Kandidat */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">{tSync('candidate_cv_field_candidate')}</label>
          <select
            value={candidateId}
            onChange={e => setCandidateId(e.target.value)}
            className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            {candidates.map(c => (
              <option key={c.candidate_id} value={c.candidate_id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* CV-fil */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">{tSync('candidate_cv_field_file')}</label>
          <FileDropZone onFileSelected={setFile} accept={ACCEPT} className="p-4 text-center">
            <div className="flex flex-col items-center gap-1 text-slate-500 text-sm">
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
        </div>

        {/* Publicerad */}
        <div className="flex items-center gap-3">
          <Toggle
            label={tSync('candidate_cv_field_published')}
            checked={published}
            onChange={() => setPublished(p => !p)}
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" size="lg" disabled={saving} onClick={onClose}>
            {tSync('jac_modal_cancel')}
          </Button>
          <Button variant="primary" size="lg" loading={saving} onClick={handleSave}>
            {tSync('candidate_cv_save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddCvForCandidateModal;
