import React, { useState, useCallback, useEffect } from 'react';
import presentationImg from '../../assets/img/Presentation.png';
import { useAuth } from '../../context/AuthContext';
import { PageWrapper, PageBackground, FileDropZone, FieldAnalysisCard, Section, BulletList } from '../../components/common';
import { SectionCard } from '../../components/common/SectionCard';
import { AIDisclaimer } from '../../components/common/AIDisclaimer';
import { useTranslation } from '../../hooks/TranslationProvider';
import { useSSE } from '../../hooks/useSSE';
import IconCvDocument from '../../components/icon_library/IconCvDocument';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ApiService } from '../../services/ApiService';
import type { SseAnalysisResult, AtsResult, Bilingual } from '../../types/analysis';

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
  const { tSync, language } = useTranslation();
  const navigate = useNavigate();

  const resolve = (value: Bilingual | string | undefined): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return language === 'en' ? (value.en || value.sv) : (value.sv || value.en);
  };

  React.useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobAdText, setJobAdText] = useState('');
  const [sseFormData, setSseFormData] = useState<FormData | null>(null);
  const [sseProgress, setSseProgress] = useState<{progress: number} | null>(null);
  const [sseMessages, setSseMessages] = useState<string[]>([]);
  const [sseError, setSseError] = useState<string | null>(null);
  const [partialResult, setPartialResult] = useState<{ atsResult?: AtsResult; finalResult?: SseAnalysisResult } | null>(null);

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
    setSseMessages([]);
    setPartialResult(null);
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
      setSseProgress({ progress: data.progress });
      if (data.message) setSseMessages(prev => [...prev, data.message!]);
      if (data.atsResult) setPartialResult(prev => ({ ...(prev ?? {}), atsResult: data.atsResult }));
    },
    (result) => {
      setSseProgress(null);
      setSseMessages([]);
      setPartialResult(prev => ({ ...(prev ?? {}), finalResult: result }));
    },
    (err) => {
      setSseError(typeof err === 'string' ? err : tSync('compareCvToJobAdPage_error_generic'));
      setSseProgress(null);
      setSseMessages([]);
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
              <ul className="text-sm space-y-1 mt-2">
                {sseMessages.map((msg, i) => (
                  <li key={i} className={i === sseMessages.length - 1 ? 'font-semibold' : 'text-slate-400'}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

        </SectionCard>

        {/* Progressive results — appear as SSE data arrives */}
        {partialResult && (
          <SectionCard>
            {partialResult.finalResult ? (
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-blue-800">AI-analys – Resultat</h2>
                <button
                  type="button"
                  onClick={() => { setPartialResult(null); setSseError(null); }}
                  className="text-sm text-slate-500 hover:text-blue-600 font-semibold transition-colors"
                >
                  ✕ Stäng
                </button>
              </div>
            ) : (
              <h2 className="text-xl font-bold text-blue-800 mb-4">ATS-analys</h2>
            )}

            {/* ATS block — arrives at progress=60 */}
            {partialResult.atsResult && (
              <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-base font-semibold text-slate-700 mb-3">ATS-poäng</h3>
                <div className="flex flex-wrap gap-4 mb-3">
                  {typeof partialResult.atsResult.totalScore === 'number' && (
                    <div className="text-center">
                      <div className="text-3xl font-black text-blue-700">{partialResult.atsResult.totalScore}%</div>
                      <div className="text-xs text-slate-500 mt-1">ATS-totalpoäng</div>
                    </div>
                  )}
                </div>
                {Array.isArray(partialResult.atsResult.matchedSkills) && partialResult.atsResult.matchedSkills.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs font-semibold text-green-700 mb-1">Matchade kompetenser</div>
                    <div className="flex flex-wrap gap-1">
                      {partialResult.atsResult.matchedSkills.map((s: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {Array.isArray(partialResult.atsResult.missingSkills) && partialResult.atsResult.missingSkills.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-red-700 mb-1">Saknade kompetenser</div>
                    <div className="flex flex-wrap gap-1">
                      {partialResult.atsResult.missingSkills.map((s: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Full AI analysis — arrives at progress=100 */}
            {partialResult.finalResult && (() => {
              const r = partialResult.finalResult;
              return (
                <div>
                  {/* Field analysis (Template 6) — pure data */}
                  {r.field_analysis && (
                    <FieldAnalysisCard fieldAnalysis={r.field_analysis} lang={language} />
                  )}

                  {/* Skills vector similarity — big number */}
                  {typeof r.skills_vector_similarity === 'number' && !partialResult.atsResult && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border-l-4 border-emerald-400">
                      <span className="text-4xl font-black text-emerald-700">{Number(r.skills_vector_similarity).toFixed(1)}%</span>
                      <span className="ml-3 text-slate-700 font-semibold">
                        {language === 'en' ? 'Competency similarity (CV vs Job)' : 'Kompetenslikhet (CV vs Jobbannons)'}
                      </span>
                    </div>
                  )}

                  {r.summary && (
                    <Section title={language === 'en' ? 'Summary' : 'Sammanfattning'}>
                      <p className="text-gray-800 bg-blue-50 rounded p-3 border border-blue-100 text-sm">{resolve(r.summary)}</p>
                    </Section>
                  )}

                  {Array.isArray(r.matching_skills) && r.matching_skills.length > 0 && (
                    <Section title={language === 'en' ? 'Matching skills' : 'Matchande kompetenser'}>
                      <BulletList items={r.matching_skills} />
                    </Section>
                  )}

                  {Array.isArray(r.strengths) && r.strengths.length > 0 && (
                    <Section title={language === 'en' ? 'Strengths' : 'Styrkor'}>
                      <ul className="list-disc ml-6 text-gray-900 space-y-1 text-sm">
                        {r.strengths.map((item, i) => <li key={i}>{resolve(item)}</li>)}
                      </ul>
                    </Section>
                  )}

                  {Array.isArray(r.missing_requirements) && r.missing_requirements.length > 0 && (
                    <Section title={language === 'en' ? 'Missing requirements' : 'Saknade krav'}>
                      <BulletList items={r.missing_requirements} />
                    </Section>
                  )}

                  {Array.isArray(r.relevant_experiences) && r.relevant_experiences.length > 0 && (
                    <Section title={language === 'en' ? 'Relevant experiences' : 'Relevanta erfarenheter'}>
                      <BulletList items={r.relevant_experiences} />
                    </Section>
                  )}

                  {Array.isArray(r.education_and_certifications) && r.education_and_certifications.length > 0 && (
                    <Section title={language === 'en' ? 'Education & certifications' : 'Utbildning & certifieringar'}>
                      <BulletList items={r.education_and_certifications} />
                    </Section>
                  )}

                  {Array.isArray(r.gaps) && r.gaps.length > 0 && (
                    <Section title={language === 'en' ? 'Gaps' : 'Luckor'}>
                      <ul className="list-disc ml-6 text-gray-900 space-y-1 text-sm">
                        {r.gaps.map((item, i) => <li key={i}>{resolve(item)}</li>)}
                      </ul>
                    </Section>
                  )}
                </div>
              );
            })()}
          </SectionCard>
        )}
      <AIDisclaimer />
      </PageWrapper>
    </>
  );
}
export default CompareCvToJobAdPage;