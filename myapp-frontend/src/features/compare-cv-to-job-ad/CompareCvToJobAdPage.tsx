import React, { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PageWrapper, PageBackground, FileDropZone } from '../../components/common';
import { useTranslation } from '../../hooks/TranslationProvider';
import CvMatchingVisualization from '../../components/Features/CvMatchingVisualization';
import { useSSE } from '../../hooks/useSSE';

const CompareCvToJobAdPage: React.FC = () => {
  const { user } = useAuth();
  const { tSync } = useTranslation();
  const navigate = useNavigate();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobAdText, setJobAdText] = useState('');
  const [sseFormData, setSseFormData] = useState<FormData | null>(null);
  const [sseProgress, setSseProgress] = useState<{progress: number, message?: string, vectorResult?: any} | null>(null);
  const [sseResult, setSseResult] = useState<any>(null);
  const [sseError, setSseError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

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
    (data) => setSseProgress(data),
    (result) => setSseResult(result),
    (err) => setSseError(typeof err === 'string' ? err : tSync('compareCvToJobAdPage_error_generic'))
  );

  return (
    <>
      <PageBackground imageUrl="/match_CV_against_job.png" opacity={1} blur={0} />
      <PageWrapper>
        <div className="card relative z-10">
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
              <label className="block mb-1 font-semibold">
                {tSync('compareCvToJobAdPage_cv_label')}
              </label>
              <FileDropZone
                accept=".pdf,.doc,.docx"
                onFileSelected={file => setCvFile(file)}
                className="w-full p-4 mb-2 border-slate-200"
              >
                <div className="flex flex-col items-center justify-center text-slate-500">
                  <span className="mb-2">{tSync('compareCvToJobAdPage_dropzone_label')}</span>
                  {cvFile && <span className="text-blue-600 font-semibold">{cvFile.name}</span>}
                </div>
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
          {/* SSE Progressbar & status */}
          {sseProgress && (
            <div className="mt-6">
              <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden mb-2">
                <div
                  className="h-4 bg-gradient-to-r from-blue-600 via-green-500 to-yellow-400 transition-all"
                  style={{ width: `${sseProgress.progress}%` }}
                />
              </div>
              <div className="text-sm font-semibold mb-2">{sseProgress.message}</div>
              {sseProgress.vectorResult && (
                <div className="p-3 bg-blue-50 rounded flex flex-col gap-1">
                  <div className="font-bold">Vektorjämförelse</div>
                  <div>Similarity: {sseProgress.vectorResult.similarityScore}%</div>
                  <div>CV Vector Size: {sseProgress.vectorResult.cvVectorSize}</div>
                  <div>JobAd Vector Size: {sseProgress.vectorResult.jobAdVectorSize}</div>
                </div>
              )}
            </div>
          )}
          {/* SSE slutresultat: visa CvMatchingVisualization om klart */}
          {sseResult && (
            <div className="mt-6">
              <CvMatchingVisualization
                matchPercentage={sseResult.matchPercentage}
                totalMatchPercentage={sseResult.totalMatchPercentage}
                skillsMatchPercentage={sseResult.skillsMatchPercentage}
                professionMatch={sseResult.professionMatch}
                breakdown={sseResult.breakdown}
                totalScore={sseResult.totalScore}
                skillsScore={sseResult.skillsScore}
                professionScore={sseResult.professionScore}
                cvProfession={sseResult.cvProfession}
                jobProfession={sseResult.jobProfession}
                totalRequirements={sseResult.totalRequirements}
                matches={sseResult.matches || []}
                topGaps={sseResult.topGaps || []}
                careerSummaryPitch={sseResult.CareerSummaryPitch || sseResult.careerSummaryPitch}
              />
              {/* Enkel rendering av FitSummary och MatchingSkills */}
              <div className="mt-6 p-4 bg-slate-50 rounded shadow">
                <h3 className="font-bold mb-2">AI-analys (rådata)</h3>
                {sseResult.FitSummary && (
                  <div className="mb-2"><b>FitSummary:</b> {sseResult.FitSummary}</div>
                )}
                {Array.isArray(sseResult.MatchingSkills) && (
                  <div className="mb-2">
                    <b>Matching Skills:</b>
                    <ul className="list-disc ml-6">
                      {sseResult.MatchingSkills.map((skill: string, i: number) => (
                        <li key={i}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Lägg till fler fält om du vill */}
              </div>
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  );
};

export default CompareCvToJobAdPage;
