import React, { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageWrapper, PageBackground, FileDropZone } from '../../components/common';
import { SectionCard } from '../../components/common/SectionCard';
import { useTranslation } from '../../hooks/TranslationProvider';
import { useSSE } from '../../hooks/useSSE';
import IconCvDocument from '../../components/icon_library/IconCvDocument';
import { useNavigate } from 'react-router-dom';

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
      console.log('PROGRESS:', data); // ← Kolla vectorResult här
      setSseProgress(data);
      if (data.vectorResult) {
        setVectorResult(data.vectorResult);
      }
    },
    (result) => {
      console.log('RESULT:', result); // ← Kolla vad som kommer HIT
      setSseResult(result);
      if (result.vectorResult) {
        setVectorResult(result.vectorResult);
      }
    },
    (err) => setSseError(typeof err === 'string' ? err : tSync('compareCvToJobAdPage_error_generic'))
  );

  return (
    <>
      <PageBackground imageUrl="/match_CV_against_job.png" opacity={1} blur={0} />
      <PageWrapper>
        <SectionCard className="relative z-10">
          <h2 className="text-2xl font-bold mb-4">{tSync('compareCvToJobAdPage_title') || 'Matcha CV mot jobbannons'}</h2>
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
            <div>
              <label className="block mb-1 font-semibold">
                {tSync('compareCvToJobAdPage_jobad_label')}
              </label>
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
              <button
                type="submit"
                disabled={!!sseProgress && sseProgress.progress > 0 && sseProgress.progress < 100}
                className="w-full bg-gradient-to-r from-blue-600 via-green-500 to-yellow-400 text-white py-2 rounded font-semibold hover:from-blue-700 hover:to-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sseProgress && sseProgress.progress > 0 && sseProgress.progress < 100
                  ? tSync('compareCvToJobAdPage_button_comparing')
                  : '🚀 Realtidsanalys'}
              </button>
            </div>
          </form>
          {/* SSE Progressbar & status - visas bara om inget resultat finns! */}
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
          {/* SSE slutresultat: visa CvMatchingVisualization om klart */}
          {sseResult && (
            <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-blue-100">
              <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b border-blue-200 pb-2">AI-analys – Sammanfattning</h2>
              {/* Likhetspoäng överst, alltid från vectorResult om finns */}
              {vectorResult?.similarityScore !== undefined && (
                <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border-l-4 border-emerald-400">
                  <span className="text-4xl font-black text-emerald-700">{Number(vectorResult.similarityScore).toFixed(1)}%</span>
                  <span className="ml-3 text-slate-700 font-semibold">Semantisk likhet</span>
                </div>
              )}
              {/* FitSummary */}
              {sseResult.FitSummary && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-blue-700 mb-1">Sammanfattning</h3>
                  <p className="text-gray-800 bg-blue-50 rounded p-3 border border-blue-100">{sseResult.FitSummary}</p>
                </div>
              )}
              {/* Matching Skills */}
              {Array.isArray(sseResult.MatchingSkills) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-blue-700 mb-1">Matchande kompetenser</h3>
                  <ul className="list-disc ml-8 text-gray-900">
                    {sseResult.MatchingSkills.map((skill: string, i: number) => (
                      <li key={i} className="mb-1">{skill}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Missing Requirements */}
              {Array.isArray(sseResult.MissingRequirements) && sseResult.MissingRequirements.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-blue-700 mb-1">Saknade krav</h3>
                  <ul className="list-disc ml-8 text-gray-900">
                    {sseResult.MissingRequirements.map((req: string, i: number) => (
                      <li key={i} className="mb-1">{req}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Relevant Experiences */}
              {Array.isArray(sseResult.RelevantExperiences) && sseResult.RelevantExperiences.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-blue-700 mb-1">Relevanta erfarenheter</h3>
                  <ul className="list-disc ml-8 text-gray-900">
                    {sseResult.RelevantExperiences.map((exp: string, i: number) => (
                      <li key={i} className="mb-1">{exp}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Education and Certifications */}
              {Array.isArray(sseResult.EducationAndCertifications) && sseResult.EducationAndCertifications.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-blue-700 mb-1">Utbildning & certifieringar</h3>
                  <ul className="list-disc ml-8 text-gray-900">
                    {sseResult.EducationAndCertifications.map((edu: string, i: number) => (
                      <li key={i} className="mb-1">{edu}</li>
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
