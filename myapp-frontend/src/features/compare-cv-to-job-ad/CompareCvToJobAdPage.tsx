import React, { useState, useCallback, useEffect, useRef } from 'react';
import presentationImg from '../../assets/img/Presentation.png';
import { useAuth } from '../../context/AuthContext';
import { PageWrapper, PageBackground, FileDropZone } from '../../components/common';
import { SectionCard } from '../../components/common/SectionCard';
import { useTranslation } from '../../hooks/TranslationProvider';
import { useSSE } from '../../hooks/useSSE';
import IconCvDocument from '../../components/icon_library/IconCvDocument';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ApiService } from '../../services/ApiService';

type SavedItem = { id: number; name: string; text: string; created_at: string };

function SavedTextPanel({
  label,
  items,
  onSave,
  onDelete,
  onSelect,
  saving,
  nameValue,
  onNameChange,
  canSave,
  onUpdateName,
}: {
  label: string;
  items: SavedItem[];
  onSave: () => void;
  onDelete: (id: number) => void;
  onSelect: (text: string) => void;
  saving: boolean;
  nameValue: string;
  onNameChange: (name: string) => void;
  canSave: boolean;
  onUpdateName?: () => void;
}) {
  const [selectedId, setSelectedId] = useState<number | ''>('');

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setSelectedId(id || '');
    const item = items.find(i => i.id === id);
    if (item) onSelect(item.text);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    onDelete(selectedId as number);
    setSelectedId('');
  };

  // Reset selectedId if item is deleted
  useEffect(() => {
    if (selectedId && !items.find(i => i.id === selectedId)) setSelectedId('');
  }, [items, selectedId]);

  return (
    <div className="mb-2">
      <div className="flex flex-wrap gap-2 items-center mb-2">
        <select
          aria-label={`Välj sparad ${label}`}
          className="border border-slate-300 rounded px-3 py-1.5 text-sm bg-white min-w-[200px] flex-1"
          value={selectedId}
          onChange={handleSelect}
        >
          <option value="">— Välj sparad {label} —</option>
          {items.map(item => (
            <option key={item.id} value={item.id}>
              {item.name || item.text.slice(0, 60)}
            </option>
          ))}
        </select>
        {selectedId !== '' && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-3 py-1.5 text-sm bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 transition"
          >
            Ta bort
          </button>
        )}
      </div>
      {canSave && (
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            value={nameValue}
            onChange={e => onNameChange(e.target.value)}
            placeholder={`Namn (frivilligt) – annars används de första orden`}
            className="border border-slate-300 rounded px-3 py-1.5 text-sm bg-white flex-1 min-w-[200px]"
          />
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition disabled:opacity-50"
          >
            {saving ? 'Sparar…' : `Spara ${label}`}
          </button>
        </div>
      )}
      {!canSave && onUpdateName && (
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            value={nameValue}
            onChange={e => onNameChange(e.target.value)}
            placeholder="Lägg till namn på den sparade annonsen…"
            className="border border-slate-300 rounded px-3 py-1.5 text-sm bg-white flex-1 min-w-[200px]"
          />
          <button
            type="button"
            onClick={onUpdateName}
            disabled={saving || !nameValue.trim()}
            className="px-3 py-1.5 text-sm bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition disabled:opacity-50"
          >
            {saving ? 'Uppdaterar…' : 'Uppdatera namn'}
          </button>
        </div>
      )}
    </div>
  );
}

const CompareCvToJobAdPage: React.FC = () => {
  const { user } = useAuth();
  const { tSync } = useTranslation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobAdText, setJobAdText] = useState('');
  const [sseFormData, setSseFormData] = useState<FormData | null>(null);
  const [sseProgress, setSseProgress] = useState<{progress: number, message?: string, vectorResult?: any} | null>(null);
  const [sseError, setSseError] = useState<string | null>(null);
  const vectorResultRef = useRef<any>(null);

  // Saved CVs & Job Ads state
  const [savedCVs, setSavedCVs] = useState<SavedItem[]>([]);
  const [selectedCVId, setSelectedCVId] = useState<number | null>(null);
  const [savedJobAds, setSavedJobAds] = useState<SavedItem[]>([]);
  const [savingCV, setSavingCV] = useState(false);
  const [savingJobAd, setSavingJobAd] = useState(false);
  const [cvSaveError, setCvSaveError] = useState<string | null>(null);
  const [cvName, setCvName] = useState('');
  const [jobAdName, setJobAdName] = useState('');
  const [jobAdDirty, setJobAdDirty] = useState(false);
  const [unsavedJobAdNameId, setUnsavedJobAdNameId] = useState<number | null>(null);

  // Load saved items on mount
  useEffect(() => {
    if (!user) return;
    ApiService.getExternalCVs().then(setSavedCVs).catch(() => {});
    ApiService.getExternalJobAds().then(setSavedJobAds).catch(() => {});
  }, [user]);

  const handleSaveCVFile = useCallback(async () => {
    if (!cvFile) return;
    setCvSaveError(null);
    setSavingCV(true);
    try {
      const created = await ApiService.uploadCVPDF(cvFile, cvName.trim() || undefined);
      setSavedCVs(prev => [created, ...prev]);
      setSelectedCVId(created.id);
      setCvFile(null);
      setCvName('');
    } catch (err: any) {
      const msg = err?.message?.includes('400')
        ? 'Kunde inte extrahera text ur filen. Kontrollera att det är en giltig PDF/DOCX.'
        : 'Uppladdning misslyckades. Försök igen.';
      setCvSaveError(msg);
    } finally {
      setSavingCV(false);
    }
  }, [cvFile, cvName]);

  const handleDeleteCV = useCallback(async (id: number) => {
    await ApiService.deleteExternalCV(id);
    setSavedCVs(prev => prev.filter(c => c.id !== id));
    if (selectedCVId === id) setSelectedCVId(null);
  }, [selectedCVId]);

  const handleSaveJobAd = useCallback(async () => {
    if (!jobAdText.trim()) return;
    setSavingJobAd(true);
    try {
      const created = await ApiService.createExternalJobAd(jobAdText.trim(), jobAdName.trim() || undefined);
      setSavedJobAds(prev => [created, ...prev]);
      setJobAdDirty(false);
      if (!jobAdName.trim()) {
        // saved without name — keep field visible so user can add one
        setUnsavedJobAdNameId(created.id);
      } else {
        setJobAdName('');
        setUnsavedJobAdNameId(null);
      }
    } finally {
      setSavingJobAd(false);
    }
  }, [jobAdText, jobAdName]);

  const handleUpdateJobAdName = useCallback(async () => {
    if (!unsavedJobAdNameId || !jobAdName.trim()) return;
    setSavingJobAd(true);
    try {
      const updated = await ApiService.updateExternalJobAdName(unsavedJobAdNameId, jobAdName.trim());
      setSavedJobAds(prev => prev.map(j => j.id === updated.id ? updated : j));
      setJobAdName('');
      setUnsavedJobAdNameId(null);
    } finally {
      setSavingJobAd(false);
    }
  }, [unsavedJobAdNameId, jobAdName]);

  const handleDeleteJobAd = useCallback(async (id: number) => {
    await ApiService.deleteExternalJobAd(id);
    setSavedJobAds(prev => prev.filter(j => j.id !== id));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSseError(null);
    setSseProgress(null);
    if (!selectedCVId && !cvFile) {
      setSseError(tSync('compareCvToJobAdPage_error_cv_required'));
      return;
    }
    if (!jobAdText.trim()) {
      setSseError(tSync('compareCvToJobAdPage_error_jobad_required'));
      return;
    }

    // Auto-spara CV-filen om den inte redan är sparad i databasen
    let cvIdToUse = selectedCVId;
    if (!selectedCVId && cvFile) {
      setSavingCV(true);
      try {
        const created = await ApiService.uploadCVPDF(cvFile, cvName.trim() || undefined);
        setSavedCVs(prev => [created, ...prev]);
        setSelectedCVId(created.id);
        setCvFile(null);
        setCvName('');
        cvIdToUse = created.id;
      } catch {
        setSseError('Kunde inte ladda upp CV-filen. Försök igen.');
        setSavingCV(false);
        return;
      }
      setSavingCV(false);
    }

    const formData = new FormData();
    if (cvIdToUse) {
      formData.append('external_cv_id', String(cvIdToUse));
    }
    formData.append('JobAdText', jobAdText);
    setSseFormData(formData);
  }, [selectedCVId, cvFile, jobAdText, tSync]);

  useSSE(
    '/home/CompareCvJobSSE',
    sseFormData,
    (data) => {
      setSseProgress(data);
      if (data.vectorResult) { vectorResultRef.current = data.vectorResult; }
    },
    (result) => {
      setSseProgress(null);
      navigate('/ai-analysis-result', {
        state: { sseResult: result, vectorResult: vectorResultRef.current },
      });
    },
    (err) => {
      setSseError(typeof err === 'string' ? err : tSync('compareCvToJobAdPage_error_generic'));
      setSseProgress(null);
    }
  );

  return (
    <>
      <PageBackground imageUrl={presentationImg} opacity={1} blur={0} className="!z-[2]" />
      <PageWrapper className="relative z-10">
        <SectionCard>
          <h2 className="text-2xl font-bold mb-4">{tSync('compareCvToJobAdPage_title') || 'Matcha CV mot jobbannons'}</h2>
          <p className="text-sm text-slate-600 mb-6">{tSync('compareCvToJobAdPage_about')}</p>
          <section className="mb-6">
            <h3 className="font-semibold mb-2">{tSync('compareCvToJobAdPage_howto_title')}</h3>
            <ol className="list-decimal ml-6 text-slate-700 space-y-1">
              <li>{tSync('compareCvToJobAdPage_step1')}</li>
              <li>{tSync('compareCvToJobAdPage_step2')}</li>
              <li>{tSync('compareCvToJobAdPage_step3')}</li>
              <li>{tSync('compareCvToJobAdPage_step4')}</li>
            </ol>
          </section>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* CV – sparad dropdown + ny uppladdning */}
            <div>
              <label className="block mb-1 font-semibold">{tSync('compareCvToJobAdPage_cv_label') || 'CV-fil'}</label>

              {/* Dropdown med sparade CVs */}
              <div className="flex flex-wrap gap-2 items-center mb-3">
                <select
                  aria-label="Välj sparad CV"
                  className="border border-slate-300 rounded px-3 py-1.5 text-sm bg-white min-w-[200px] flex-1"
                  value={selectedCVId ?? ''}
                  onChange={e => {
                    const id = Number(e.target.value) || null;
                    setSelectedCVId(id);
                    if (id) setCvFile(null);
                  }}
                >
                  <option value="" disabled={selectedCVId !== null} hidden={selectedCVId !== null}>— Välj sparad CV —</option>
                  {savedCVs.map(cv => (
                    <option key={cv.id} value={cv.id}>
                      {cv.name || cv.text.slice(0, 60)}
                    </option>
                  ))}
                </select>
                {selectedCVId !== null && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCV(selectedCVId)}
                    className="px-3 py-1.5 text-sm bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 transition"
                  >
                    Ta bort
                  </button>
                )}
              </div>

              {/* FileDropZone för ny PDF */}
              <FileDropZone
                accept=".pdf,.doc,.docx"
                onFileSelected={file => { setCvFile(file); setSelectedCVId(null); setCvSaveError(null); }}
                className="border border-slate-300 rounded-lg p-6 flex flex-col bg-white w-full max-w-[420px] justify-between cursor-pointer transition hover:shadow-md"
                style={{ minHeight: 200 }}
              >
                <div className="flex flex-col items-center mb-2 pointer-events-none">
                  <div className="relative mb-2">
                    <IconCvDocument className="w-14 h-14" />
                    {cvFile && (
                      <span className="absolute -top-1 -right-1 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#22c55e"/><path d="M6 10.5l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-xl text-center leading-tight">{tSync('compareCvToJobAdPage_cv_label') || 'CV-fil'}</div>
                  <div className="text-slate-400 text-sm mt-1 text-center">{tSync('compareCvToJobAdPage_dropzone_label') || 'Dra och släpp CV-filen här eller klicka för att välja'}</div>
                </div>
                <div className="flex-1" />
                {cvFile && (
                  <div className="text-blue-600 text-sm mt-4 font-semibold text-center pointer-events-none">{cvFile.name}</div>
                )}
              </FileDropZone>

              {/* Spara CV-knapp — visas bara när ny fil är vald */}
              {cvFile && !selectedCVId && (
                <div className="mt-2 flex flex-col gap-2">
                  <input
                    type="text"
                    value={cvName}
                    onChange={e => setCvName(e.target.value)}
                    placeholder="Namn på CV (frivilligt) – annars används filnamnet"
                    className="border border-slate-300 rounded px-3 py-1.5 text-sm bg-white w-full max-w-[420px]"
                  />
                  <button
                    type="button"
                    disabled={savingCV}
                    onClick={handleSaveCVFile}
                    className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition disabled:opacity-50 self-start"
                  >
                    {savingCV ? 'Sparar…' : 'Spara CV'}
                  </button>
                  {cvSaveError && (
                    <p className="text-red-600 text-xs">{cvSaveError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Job Ad – text area */}
            <div>
              <label className="block mb-1 font-semibold">
                {tSync('compareCvToJobAdPage_jobad_label')}
              </label>
              <SavedTextPanel
                label="jobbannons"
                items={savedJobAds}
                onSave={handleSaveJobAd}
                onDelete={handleDeleteJobAd}
                onSelect={text => { setJobAdText(text); setJobAdDirty(false); setUnsavedJobAdNameId(null); setJobAdName(''); }}
                saving={savingJobAd}
                nameValue={jobAdName}
                onNameChange={setJobAdName}
                canSave={jobAdDirty && jobAdText.trim().length > 0}
                onUpdateName={unsavedJobAdNameId !== null ? handleUpdateJobAdName : undefined}
              />
              <textarea
                value={jobAdText}
                onChange={e => { setJobAdText(e.target.value); setJobAdDirty(true); }}
                rows={6}
                className="w-full border border-slate-200 rounded-md px-3 py-2"
                placeholder={tSync('compareCvToJobAdPage_jobad_placeholder')}
              />
            </div>

            {sseError && <div className="text-red-600 text-sm mt-2">{sseError}</div>}
            <div className="flex gap-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!!sseProgress && sseProgress.progress > 0 && sseProgress.progress < 100}
              >
                {sseProgress && sseProgress.progress > 0 && sseProgress.progress < 100
                  ? tSync('compareCvToJobAdPage_button_comparing')
                  : 'Realtidsanalys'}
              </Button>
            </div>
          </form>

          {/* SSE Progressbar */}
          {sseProgress && (
            <div className="mt-6">
              <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden mb-2">
                <div
                  className="h-4 bg-gradient-to-r from-blue-600 via-green-500 to-yellow-400 transition-all"
                  style={{ width: `${sseProgress.progress}%` }}
                />
              </div>
              <div className="text-sm font-semibold mb-2">{sseProgress.message}</div>
              {sseProgress.vectorResult && typeof sseProgress.vectorResult.similarityScore === 'number' && (
                <div className="text-lg font-bold text-blue-700 mt-2">
                  Likhetspoäng (vector): {sseProgress.vectorResult.similarityScore}%
                </div>
              )}
            </div>
          )}

        </SectionCard>
      </PageWrapper>
    </>
  );
}
export default CompareCvToJobAdPage;