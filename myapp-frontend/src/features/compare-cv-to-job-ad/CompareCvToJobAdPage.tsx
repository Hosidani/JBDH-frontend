import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageWrapper, PageBackground, FileDropZone } from '../../components/common';
import { SectionCard } from '../../components/common/SectionCard';
import { useTranslation } from '../../hooks/TranslationProvider';
import { useSSE } from '../../hooks/useSSE';
import IconCvDocument from '../../components/icon_library/IconCvDocument';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ApiService } from '../../services/ApiService';

type SavedItem = { id: number; text: string; created_at: string };

function SavedTextPanel({
  label,
  items,
  onSave,
  onDelete,
  onSelect,
  saving,
}: {
  label: string;
  items: SavedItem[];
  onSave: () => void;
  onDelete: (id: number) => void;
  onSelect: (text: string) => void;
  saving: boolean;
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
    <div className="flex flex-wrap gap-2 items-center mb-2">
      <select
        className="border border-slate-300 rounded px-3 py-1.5 text-sm bg-white min-w-[200px] flex-1"
        value={selectedId}
        onChange={handleSelect}
      >
        <option value="">— Välj sparad {label} —</option>
        {items.map(item => (
          <option key={item.id} value={item.id}>
            {item.text.slice(0, 60)}{item.text.length > 60 ? '…' : ''}
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
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition disabled:opacity-50"
      >
        {saving ? 'Sparar…' : `Spara ${label}`}
      </button>
    </div>
  );
}

const CompareCvToJobAdPage: React.FC = () => {
  const { user } = useAuth();
  const { tSync } = useTranslation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('requireLogin'));
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobAdText, setJobAdText] = useState('');
  const [sseFormData, setSseFormData] = useState<FormData | null>(null);
  const [sseProgress, setSseProgress] = useState<{progress: number, message?: string, vectorResult?: any} | null>(null);
  const [sseResult, setSseResult] = useState<any>(null);
  const [sseError, setSseError] = useState<string | null>(null);
  const [vectorResult, setVectorResult] = useState<any>(null);

  // Saved CVs & Job Ads state
  const [savedCVs, setSavedCVs] = useState<SavedItem[]>([]);
  const [savedJobAds, setSavedJobAds] = useState<SavedItem[]>([]);
  const [savingCV, setSavingCV] = useState(false);
  const [savingJobAd, setSavingJobAd] = useState(false);
  const [cvText, setCvText] = useState('');

  // Load saved items on mount
  useEffect(() => {
    if (!user) return;
    ApiService.getExternalCVs().then(setSavedCVs).catch(() => {});
    ApiService.getExternalJobAds().then(setSavedJobAds).catch(() => {});
  }, [user]);

  const handleSaveCV = useCallback(async () => {
    if (!cvText.trim()) return;
    setSavingCV(true);
    try {
      const created = await ApiService.createExternalCV(cvText.trim());
      setSavedCVs(prev => [created, ...prev]);
    } finally {
      setSavingCV(false);
    }
  }, [cvText]);

  const handleDeleteCV = useCallback(async (id: number) => {
    await ApiService.deleteExternalCV(id);
    setSavedCVs(prev => prev.filter(c => c.id !== id));
  }, []);

  const handleSaveJobAd = useCallback(async () => {
    if (!jobAdText.trim()) return;
    setSavingJobAd(true);
    try {
      const created = await ApiService.createExternalJobAd(jobAdText.trim());
      setSavedJobAds(prev => [created, ...prev]);
    } finally {
      setSavingJobAd(false);
    }
  }, [jobAdText]);

  const handleDeleteJobAd = useCallback(async (id: number) => {
    await ApiService.deleteExternalJobAd(id);
    setSavedJobAds(prev => prev.filter(j => j.id !== id));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSseError(null);
    setSseResult(null);
    setSseProgress(null);
    if (!cvFile) {
      setSseError(tSync('compareCvToJobAdPage_error_cv_required'));
      return;
    }
    if (!jobAdText.trim()) {
      setSseError(tSync('compareCvToJobAdPage_error_jobad_required'));
      return;
    }
    const formData = new FormData();
    formData.append('CvPath', cvFile);
    formData.append('JobAdText', jobAdText);
    setSseFormData(formData);
  }, [cvFile, jobAdText, tSync]);

  useSSE(
    '/home/CompareCvJobSSE',
    sseFormData,
    (data) => {
      setSseProgress(data);
      if (data.vectorResult) setVectorResult(data.vectorResult);
    },
    (result) => {
      setSseResult(result);
      if (result.vectorResult) setVectorResult(result.vectorResult);
    },
    (err) => setSseError(typeof err === 'string' ? err : tSync('compareCvToJobAdPage_error_generic'))
  );

  return (
    <>
      <PageBackground imageUrl="/match_CV_against_job.png" opacity={1} blur={0} />
      <PageWrapper>
        <SectionCard className="relative z-10">
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
            {/* CV – file upload */}
            <div>
              <FileDropZone
                accept=".pdf,.doc,.docx"
                onFileSelected={file => setCvFile(file)}
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
                  <div className="font-bold text-xl text-center leading-tight">{tSync('compareCvToJobAdPage_cv_label')}</div>
                  <div className="text-slate-400 text-sm mt-1 text-center">{tSync('compareCvToJobAdPage_dropzone_label')}</div>
                </div>
                <div className="flex-1" />
                {cvFile && (
                  <div className="text-blue-600 text-sm mt-4 font-semibold text-center pointer-events-none">{cvFile.name}</div>
                )}
              </FileDropZone>
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
                onSelect={setJobAdText}
                saving={savingJobAd}
              />
              <textarea
                value={jobAdText}
                onChange={e => setJobAdText(e.target.value)}
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

          {/* Saved CV text (for storage & reuse) */}
          <div className="mt-6 border-t border-slate-200 pt-6">
            <h3 className="font-semibold mb-1">Spara CV som text</h3>
            <p className="text-xs text-slate-500 mb-3">Klistra in ditt CV som text för att spara och återanvända det.</p>
            <SavedTextPanel
              label="CV"
              items={savedCVs}
              onSave={handleSaveCV}
              onDelete={handleDeleteCV}
              onSelect={setCvText}
              saving={savingCV}
            />
            <textarea
              value={cvText}
              onChange={e => setCvText(e.target.value)}
              rows={6}
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
              placeholder="Klistra in ditt CV-innehåll här…"
            />
          </div>

          {/* SSE Progressbar */}
          {!sseResult && sseProgress && (
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

          {/* SSE result */}
          {sseResult && (
            <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-blue-100">
              <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b border-blue-200 pb-2">AI-analys – Sammanfattning</h2>
              {vectorResult?.similarityScore !== undefined && (
                <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border-l-4 border-emerald-400">
                  <span className="text-4xl font-black text-emerald-700">{Number(vectorResult.similarityScore).toFixed(1)}%</span>
                  <span className="ml-3 text-slate-700 font-semibold">Semantisk likhet(CV vs Jobbannons)</span>
                </div>
              )}
              {typeof sseResult.profession_vector_similarity === 'number' && (
                <div className="mb-2">
                  <span className="font-semibold">Profession-likhet (vektor): </span>
                  <span>{sseResult.profession_vector_similarity}%</span>
                </div>
              )}
              {typeof sseResult.skills_vector_similarity === 'number' && (
                <div className="mb-6">
                  <span className="font-semibold">Kompetens-likhet (vektor): </span>
                  <span>{sseResult.skills_vector_similarity}%</span>
                </div>
              )}
              {sseResult.summary && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-blue-700 mb-1">Sammanfattning</h3>
                  <p className="text-gray-800 bg-blue-50 rounded p-3 border border-blue-100">{sseResult.summary}</p>
                </div>
              )}
              {Array.isArray(sseResult.matching_skills) && sseResult.matching_skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-blue-700 mb-1">Matchande kompetenser</h3>
                  <ul className="list-disc ml-8 text-gray-900">
                    {sseResult.matching_skills.map((skill: any, i: number) => (
                      <li key={i} className="mb-1">{typeof skill === 'string' ? skill : skill.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(sseResult.missing_requirements) && sseResult.missing_requirements.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-blue-700 mb-1">Saknade krav</h3>
                  <ul className="list-disc ml-8 text-gray-900">
                    {sseResult.missing_requirements.map((req: any, i: number) => (
                      <li key={i} className="mb-1">{typeof req === 'string' ? req : req.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(sseResult.relevant_experiences) && sseResult.relevant_experiences.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-blue-700 mb-1">Relevanta erfarenheter</h3>
                  <ul className="list-disc ml-8 text-gray-900">
                    {sseResult.relevant_experiences.map((exp: any, i: number) => (
                      <li key={i} className="mb-1">{exp}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(sseResult.education_and_certifications) && sseResult.education_and_certifications.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-blue-700 mb-1">Utbildning & certifieringar</h3>
                  <ul className="list-disc ml-8 text-gray-900">
                    {sseResult.education_and_certifications.map((edu: any, i: number) => (
                      <li key={i} className="mb-1">{edu}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(sseResult.strengths) && sseResult.strengths.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-blue-700 mb-1">Styrkor</h3>
                  <ul className="list-disc ml-8 text-gray-900">
                    {sseResult.strengths.map((item: any, i: number) => (
                      <li key={i} className="mb-1">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(sseResult.gaps) && sseResult.gaps.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-blue-700 mb-1">Luckor</h3>
                  <ul className="list-disc ml-8 text-gray-900">
                    {sseResult.gaps.map((item: any, i: number) => (
                      <li key={i} className="mb-1">{item}</li>
                    ))}
                  </ul>
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