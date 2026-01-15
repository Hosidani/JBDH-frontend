import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PageWrapper, PageBackground, FileDropZone } from '../../components/common';
import { useTranslation } from '../../hooks/TranslationProvider';
import CvMatchingVisualization from '../../components/Features/CvMatchingVisualization';

const CompareCvToJobAdPage: React.FC = () => {
  const { user } = useAuth();
  const { tSync } = useTranslation();
  const navigate = useNavigate();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobAdText, setJobAdText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Add any user-dependent logic here, guarded by null check
  }, [user, navigate]);


  const handleSubmit = async (e: React.FormEvent, useV2 = false) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    
    // Validate required fields
    if (!cvFile) {
      setError(tSync('compareCvToJobAdPage_error_cv_required'));
      return;
    }
    
    if (!jobAdText.trim()) {
      setError(tSync('compareCvToJobAdPage_error_jobad_required'));
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('CvPath', cvFile);
      formData.append('JobAdText', jobAdText);
      const endpoint = useV2 ? '/api/Home/CompareCvToJobAdV2' : '/api/Home/CompareCvToJobAd';
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      let data = null;
      try {
        data = await response.json();
      } catch (jsonErr) {
        setError(tSync('compareCvToJobAdPage_error_parsing'));
        return;
      }
      let parsed = null;
      if (response.ok) {
        // Check if this is V4 response format (with totalScore)
        if (data.totalScore !== undefined) {
          parsed = data;
        }
        // Check if this is V3 response format (with totalMatchPercentage)
        else if (data.totalMatchPercentage !== undefined) {
          parsed = data;
        }
        // Check if this is V2 response format (with matchPercentage)
        else if (data.matchPercentage !== undefined) {
          parsed = data;
        } else if (data.analysis) {
          parsed = data.analysis;
        } else if (data.aiResponse) {
          let aiText = data.aiResponse;
          const match = aiText.match(/```json\n([\s\S]*?)```/);
          if (match) {
            aiText = match[1];
          } else if (aiText.startsWith('```json')) {
            aiText = aiText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
          }
          try {
            parsed = JSON.parse(aiText);
          } catch {
            parsed = aiText;
          }
        }
        setResult(parsed);
      } else {
        // Check for quota/rate/embedding/limit errors in backend error message
        const errorMsg = (data && data.error) ? data.error.toLowerCase() : '';
        if (
          errorMsg.includes('quota') ||
          errorMsg.includes('rate limit') ||
          errorMsg.includes('limit') ||
          errorMsg.includes('embedding') ||
          errorMsg.includes('exceeded') ||
          errorMsg.includes('free tier')
        ) {
          setError(tSync('compareCvToJobAdPage_error_service_overloaded'));
        } else {
          setError(data.error || tSync('compareCvToJobAdPage_error_comparison_failed'));
        }
      }
    } catch (err) {
      setError(tSync('compareCvToJobAdPage_error_generic'));
    } finally {
      setLoading(false);
    }
  };

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
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                onClick={(e) => handleSubmit(e, false)}
                className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? tSync('compareCvToJobAdPage_button_comparing') : tSync('compareCvToJobAdPage_button_v1')}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={(e) => handleSubmit(e, true)}
                className="flex-1 bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? tSync('compareCvToJobAdPage_button_comparing') : tSync('compareCvToJobAdPage_button_v2')}
              </button>
            </div>
          </form>
          {result && typeof result === 'object' && (result.matchPercentage !== undefined || result.totalMatchPercentage !== undefined || result.totalScore !== undefined) ? (
            <div className="mt-6">
              <CvMatchingVisualization
                matchPercentage={result.matchPercentage}
                totalMatchPercentage={result.totalMatchPercentage}
                skillsMatchPercentage={result.skillsMatchPercentage}
                professionMatch={result.professionMatch}
                breakdown={result.breakdown}
                totalScore={result.totalScore}
                skillsScore={result.skillsScore}
                professionScore={result.professionScore}
                cvProfession={result.cvProfession}
                jobProfession={result.jobProfession}
                totalRequirements={result.totalRequirements}
                matches={result.matches || []}
                topGaps={result.topGaps || []}
              />
            </div>
          ) : result && typeof result === 'object' ? (
            <div className="mt-6 p-4 bg-slate-100 rounded flex flex-col gap-4">
              <h3 className="font-bold mb-2">{tSync('compareCvToJobAdPage_result_ai_analysis')}</h3>
              {typeof result.matchScore !== 'undefined' && (
                <div className="mb-2 text-lg font-bold">{tSync('compareCvToJobAdPage_result_match_score')}: {result.matchScore}%</div>
              )}
              {result.fitAssessment && (
                <>
                  <div>
                    <span className="font-semibold">{tSync('compareCvToJobAdPage_result_summary')}</span>
                    <div className="text-slate-700 mt-1">{result.fitAssessment.overall}</div>
                  </div>
                  {result.fitAssessment.strengths && result.fitAssessment.strengths.length > 0 && (
                    <div>
                      <span className="font-semibold">{tSync('compareCvToJobAdPage_result_strengths')}</span>
                      <ul className="list-disc ml-6 mt-1 text-slate-700">
                        {result.fitAssessment.strengths.map((s: string, idx: number) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.fitAssessment.concerns && result.fitAssessment.concerns.length > 0 && (
                    <div>
                      <span className="font-semibold">{tSync('compareCvToJobAdPage_result_concerns')}</span>
                      <ul className="list-disc ml-6 mt-1 text-slate-700">
                        {result.fitAssessment.concerns.map((c: string, idx: number) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
              {result.detailedAnalysis && (
                <div>
                  <div className="font-bold mt-4 mb-2">{tSync('compareCvToJobAdPage_result_detailed_analysis')}</div>
                  {result.detailedAnalysis.technicalSkills && (
                    <div>
                      <div className="font-semibold">{tSync('compareCvToJobAdPage_result_technical_skills')} {result.detailedAnalysis.technicalSkills.matchLevel}</div>
                      {result.detailedAnalysis.technicalSkills.matches && (
                        <div>
                          <span className="font-semibold">{tSync('compareCvToJobAdPage_result_matching_technical_skills')}</span>
                          <ul className="list-disc ml-6 mt-1 text-slate-700">
                            {result.detailedAnalysis.technicalSkills.matches.map((m: string, idx: number) => (
                              <li key={idx}>{m}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.detailedAnalysis.technicalSkills.gaps && (
                        <div>
                          <span className="font-semibold">{tSync('compareCvToJobAdPage_result_technical_gaps')}</span>
                          <ul className="list-disc ml-6 mt-1 text-slate-700">
                            {result.detailedAnalysis.technicalSkills.gaps.map((g: string, idx: number) => (
                              <li key={idx}>{g}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  {result.detailedAnalysis.experience && (
                    <div>
                      <span className="font-semibold">{tSync('compareCvToJobAdPage_result_matching_experience')}</span>
                      <ul className="list-disc ml-6 mt-1 text-slate-700">
                        {result.detailedAnalysis.experience.matches.map((m: string, idx: number) => (
                          <li key={idx}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.detailedAnalysis.experience.gaps && (
                    <div>
                      <span className="font-semibold">{tSync('compareCvToJobAdPage_result_experience_gaps')}</span>
                      <ul className="list-disc ml-6 mt-1 text-slate-700">
                        {result.detailedAnalysis.experience.gaps.map((g: string, idx: number) => (
                          <li key={idx}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.detailedAnalysis.education && (
                    <div>
                      <div className="font-semibold">{tSync('compareCvToJobAdPage_result_education')} {result.detailedAnalysis.education.matchLevel}</div>
                      {result.detailedAnalysis.education.details && (
                        <div>
                          <span className="font-semibold">{tSync('compareCvToJobAdPage_result_education_details')}</span>
                          <ul className="list-disc ml-6 mt-1 text-slate-700">
                            {result.detailedAnalysis.education.details.map((d: string, idx: number) => (
                              <li key={idx}>{d}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  {result.detailedAnalysis.softSkills && (
                    <div>
                      <div className="font-semibold">{tSync('compareCvToJobAdPage_result_soft_skills')} {result.detailedAnalysis.softSkills.matchLevel}</div>
                      {result.detailedAnalysis.softSkills.evidence && (
                        <div>
                          <span className="font-semibold">{tSync('compareCvToJobAdPage_result_soft_skills_evidence')}</span>
                          <ul className="list-disc ml-6 mt-1 text-slate-700">
                            {result.detailedAnalysis.softSkills.evidence.map((e: string, idx: number) => (
                              <li key={idx}>{e}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {result.actionableRecommendations && (
                <div>
                  <div className="font-bold mt-4 mb-2">{tSync('compareCvToJobAdPage_result_recommendations')}</div>
                  {result.actionableRecommendations.cvImprovements && (
                    <div>
                      <span className="font-semibold">{tSync('compareCvToJobAdPage_result_cv_improvements')}</span>
                      <ul className="list-disc ml-6 mt-1 text-slate-700">
                        {result.actionableRecommendations.cvImprovements.map((c: string, idx: number) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.actionableRecommendations.skillDevelopment && (
                    <div>
                      <span className="font-semibold">{tSync('compareCvToJobAdPage_result_skill_development')}</span>
                      <ul className="list-disc ml-6 mt-1 text-slate-700">
                        {result.actionableRecommendations.skillDevelopment.map((s: string, idx: number) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.actionableRecommendations.interviewPreparation && (
                    <div>
                      <span className="font-semibold">{tSync('compareCvToJobAdPage_result_interview_preparation')}</span>
                      <ul className="list-disc ml-6 mt-1 text-slate-700">
                        {result.actionableRecommendations.interviewPreparation.map((i: string, idx: number) => (
                          <li key={idx}>{i}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {result.nextSteps && result.nextSteps.length > 0 && (
                <div>
                  <span className="font-semibold">{tSync('compareCvToJobAdPage_result_next_steps')}</span>
                  <ul className="list-disc ml-6 mt-1 text-slate-700">
                    {result.nextSteps.map((n: string, idx: number) => (
                      <li key={idx}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : result ? (
            <div className="mt-6 p-4 bg-slate-100 rounded">
              <h3 className="font-bold mb-2">{tSync('compareCvToJobAdPage_result_ai_analysis')}</h3>
              <pre className="whitespace-pre-wrap text-sm">{result}</pre>
            </div>
          ) : null}
        </div>
      </PageWrapper>
    </>
  );
};

export default CompareCvToJobAdPage;

