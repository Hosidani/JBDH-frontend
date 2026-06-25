import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/common';
import FileDropZone from '../../components/common/inputs/FileDropZone';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Toggle } from '../../components/ui/Toggle';
import { useTranslation } from '../../hooks/TranslationProvider';
import { LocalDbService } from '../../db/LocalDbService';
import { parseCvFile, ACCEPT_STRING } from '../../utils/parseCvFile';
import { structureCV } from '../../ai/ai';
import type { CV, Candidate } from '../../db/types';

interface Props {
  open: boolean;
  onClose: () => void;
  defaultCandidateId: string;
  candidates: Candidate[];
  editCv?: CV;
  onSaved: (cv: CV) => void;
  onTraitsUpdated?: () => void;
}

type Step = 'drop' | 'parsing' | 'review';

const AddCvForCandidateModal: React.FC<Props> = ({
  open, onClose, defaultCandidateId, candidates, editCv, onSaved, onTraitsUpdated,
}) => {
  const { tSync } = useTranslation();
  const isEdit = !!editCv;

  const [step, setStep] = useState<Step>('drop');
  const [file, setFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState('');
  const [consented, setConsented] = useState(false);
  const [cvTitle, setCvTitle] = useState('');
  const [candidateId, setCandidateId] = useState(defaultCandidateId);
  const [published, setPublished] = useState(false);
  const [cvAnonymizedText, setCvAnonymizedText] = useState('');
  const [origCvAnonymizedText, setOrigCvAnonymizedText] = useState('');
  const [manualText, setManualText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStep('drop');
      setFile(null);
      setCvText('');
      setConsented(false);
      setError(null);
      if (editCv) {
        setCvTitle(editCv.cv_title ?? '');
        setCandidateId(editCv.candidate_id);
        setPublished(editCv.cv_published);
        setCvAnonymizedText(editCv.cv_anonymized ?? '');
        setOrigCvAnonymizedText(editCv.cv_anonymized ?? '');
      } else {
        setCvTitle('');
        setCandidateId(defaultCandidateId);
        setPublished(false);
        setCvAnonymizedText('');
        setOrigCvAnonymizedText('');
        setManualText('');
      }
    }
  }, [open, editCv, defaultCandidateId]);

  const handleClose = () => {
    setStep('drop');
    setFile(null);
    setCvText('');
    setConsented(false);
    setManualText('');
    setError(null);
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

  const triggerCvAnalysis = (cvId: string, candId: string, text: string) => {
    structureCV(text)
      .then(async structured => {
        await LocalDbService.updateCV(cvId, { cv_json: JSON.stringify(structured) });
        if (structured.personal_qualities?.length) {
          const candidate = await LocalDbService.getCandidate(candId);
          if (candidate) {
            const merged = [...new Set([...(candidate.personal_qualities ?? []), ...structured.personal_qualities])];
            if (merged.length !== (candidate.personal_qualities ?? []).length) {
              await LocalDbService.updateCandidate(candId, { personal_qualities: merged, portrait: '' });
              onTraitsUpdated?.();
            }
          }
        }
      })
      .catch(() => {});
  };

  // Edit mode: save metadata (and optionally CV text) without uploading a new file
  const handleMetaSave = async () => {
    if (!isEdit || !editCv) return;
    setSaving(true);
    setError(null);
    try {
      const textChanged = cvAnonymizedText !== origCvAnonymizedText;
      const updates: Partial<CV> = {
        cv_title: cvTitle,
        candidate_id: candidateId,
        cv_published: published,
        ...(textChanged && { cv_anonymized: cvAnonymizedText, cv_json: '' }),
      };
      const updated = await LocalDbService.updateCV(editCv.cv_id, updates);
      if (textChanged) {
        await LocalDbService.updateCandidate(candidateId, { portrait: '' });
        if (cvAnonymizedText.trim()) {
          triggerCvAnalysis(editCv.cv_id, candidateId, cvAnonymizedText.trim());
        }
      }
      onSaved(updated!);
      handleClose();
    } catch {
      setError(tSync('jac_add_cv_error'));
    } finally {
      setSaving(false);
    }
  };

  // Step 2: save parsed + reviewed text
  const handleTextSave = async () => {
    if (!cvText.trim() || !consented) return;
    setSaving(true);
    setError(null);
    try {
      if (isEdit && editCv) {
        const updated = await LocalDbService.updateCV(editCv.cv_id, {
          cv_title: cvTitle,
          candidate_id: candidateId,
          cv_published: published,
          cv_anonymized: cvText.trim(),
          cv_json: '',
          cv_file: file,
          cv_file_type: file!.type,
        });
        triggerCvAnalysis(editCv.cv_id, candidateId, cvText.trim());
        onSaved(updated!);
      } else {
        const saved = await LocalDbService.addCV({
          candidate_id: candidateId,
          cv_title: cvTitle.trim() || file?.name || tSync('jac_manual_cv_title'),
          cv_anonymized: cvText.trim(),
          cv_json: '',
          cv_file: file,
          cv_file_type: file?.type ?? 'text/plain',
          cv_published: published,
        });
        triggerCvAnalysis(saved.cv_id, candidateId, cvText.trim());
        onSaved(saved);
      }
      handleClose();
    } catch {
      setError(tSync('jac_add_cv_error'));
    } finally {
      setSaving(false);
    }
  };

  const metaChanged = isEdit && editCv && (
    cvTitle !== (editCv.cv_title ?? '') ||
    candidateId !== editCv.candidate_id ||
    published !== editCv.cv_published ||
    cvAnonymizedText !== origCvAnonymizedText
  );

  const modalTitle = isEdit ? tSync('candidate_cv_edit_title') : tSync('candidate_cv_add_title');
  const isReview = step === 'review';

  const metaFields = (
    <>
      {/* Titel på CV */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">{tSync('candidate_cv_field_title')}</label>
        <input
          type="text"
          value={cvTitle}
          onChange={e => setCvTitle(e.target.value)}
          disabled={saving}
          className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        />
      </div>

      {/* Kandidat */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">{tSync('candidate_cv_field_candidate')}</label>
        <select
          value={candidateId}
          onChange={e => setCandidateId(e.target.value)}
          disabled={saving}
          className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white disabled:opacity-50"
        >
          {candidates.map(c => (
            <option key={c.candidate_id} value={c.candidate_id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Publicerad */}
      <Toggle
        label={tSync('candidate_cv_field_published')}
        checked={published}
        onChange={() => setPublished(p => !p)}
      />
    </>
  );

  return (
    <Modal open={open} onClose={handleClose} title={modalTitle} maxWidth={isReview || isEdit ? 'max-w-3xl' : 'max-w-2xl'}>
      {!isReview ? (
        // ── Steg 1: drop-zon ─────────────────────────────────────────────────
        <div className="flex flex-col gap-4">
          {metaFields}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">{tSync('candidate_cv_field_file')}</label>
            <FileDropZone
              onFileSelected={handleFileSelected}
              accept={ACCEPT_STRING}
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
          </div>

          {isEdit && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">{tSync('candidate_cv_field_text')}</label>
              <textarea
                value={cvAnonymizedText}
                onChange={e => setCvAnonymizedText(e.target.value)}
                rows={14}
                disabled={saving}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 resize-y focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono leading-relaxed disabled:opacity-50"
              />
            </div>
          )}

          {!isEdit && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-slate-200" />
                <span className="text-xs text-slate-400 uppercase tracking-wide">{tSync('jac_or')}</span>
                <div className="flex-1 border-t border-slate-200" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">{tSync('jac_manual_text_label')}</label>
                <textarea
                  value={manualText}
                  onChange={e => setManualText(e.target.value)}
                  rows={10}
                  disabled={saving || step === 'parsing'}
                  placeholder={tSync('jac_manual_text_placeholder')}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 resize-y focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono leading-relaxed disabled:opacity-50"
                />
              </div>
            </>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="lg" disabled={step === 'parsing'} onClick={handleClose}>
              {tSync('jac_modal_cancel')}
            </Button>
            {!isEdit && !file && manualText.trim() && step !== 'parsing' && (
              <Button
                variant="primary" size="lg"
                onClick={() => { setCvText(manualText.trim()); setStep('review'); }}
              >
                {tSync('jac_manual_text_next')}
              </Button>
            )}
            {isEdit && metaChanged && step !== 'parsing' && (
              <Button variant="primary" size="lg" loading={saving} onClick={handleMetaSave}>
                {tSync('candidate_cv_save')}
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

          {metaFields}

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
                {tSync('candidate_cv_save')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AddCvForCandidateModal;
