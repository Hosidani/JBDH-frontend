const API_URL = import.meta.env.VITE_API_URL;
import React, { useState } from 'react';
import PageWrapper from '../../components/PageWrapper';
import PageBackground from '../../components/PageBackground';

const CompareCvToJobAdPage: React.FC = () => {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobAdText, setJobAdText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCvFile(e.target.files[0]);
    } else {
      setCvFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const formData = new FormData();
      if (cvFile) formData.append('CvPath', cvFile);
      formData.append('JobAdText', jobAdText);
      const response = await fetch(`${API_URL}/api/Home/CompareCvToJobAd`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await response.json();
      let parsed = null;
      if (response.ok) {
        if (data.analysis) {
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
        setError(data.error || 'Något gick fel vid jämförelsen.');
      }
    } catch (err) {
      setError('Ett fel uppstod vid jämförelsen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageBackground imageUrl="/match_CV_against_job.png" />
      <PageWrapper>
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Matcha CV mot jobbannons</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block mb-1 font-semibold">CV-fil</label>
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} required />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Jobbannons (text)</label>
              <textarea
                value={jobAdText}
                onChange={e => setJobAdText(e.target.value)}
                rows={6}
                className="input-dark w-full border border-slate-200 rounded-md px-3 py-2"
                required
              />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
            >
              {loading ? 'Jämför...' : 'Jämför CV mot annons'}
            </button>
          </form>
          {result && typeof result === 'object' ? (
            <div className="mt-6 p-4 bg-slate-100 rounded flex flex-col gap-4">
              <h3 className="font-bold mb-2">AI-analys:</h3>
              {typeof result.matchScore !== 'undefined' && (
                <div className="mb-2 text-lg font-bold">Match Score: {result.matchScore}%</div>
              )}
              {result.fitAssessment && (
                <>
                  <div>
                    <span className="font-semibold">Sammanfattning:</span>
                    <div className="text-slate-700 mt-1">{result.fitAssessment.overall}</div>
                  </div>
                  {result.fitAssessment.strengths && result.fitAssessment.strengths.length > 0 && (
                    <div>
                      <span className="font-semibold">Styrkor:</span>
                      <ul className="list-disc ml-6 mt-1 text-slate-700">
                        {result.fitAssessment.strengths.map((s: string, idx: number) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.fitAssessment.concerns && result.fitAssessment.concerns.length > 0 && (
                    <div>
                      <span className="font-semibold">Orosmoment:</span>
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
                  <div className="font-bold mt-4 mb-2">Detaljerad analys</div>
                  {result.detailedAnalysis.technicalSkills && (
                    <div>
                      <div className="font-semibold">Tekniska färdigheter (nivå): {result.detailedAnalysis.technicalSkills.matchLevel}</div>
                      {result.detailedAnalysis.technicalSkills.matches && (
                        <div>
                          <span className="font-semibold">Matchande tekniska färdigheter:</span>
                          <ul className="list-disc ml-6 mt-1 text-slate-700">
                            {result.detailedAnalysis.technicalSkills.matches.map((m: string, idx: number) => (
                              <li key={idx}>{m}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.detailedAnalysis.technicalSkills.gaps && (
                        <div>
                          <span className="font-semibold">Tekniska gap:</span>
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
                      <span className="font-semibold">Matchande erfarenhet:</span>
                      <ul className="list-disc ml-6 mt-1 text-slate-700">
                        {result.detailedAnalysis.experience.matches.map((m: string, idx: number) => (
                          <li key={idx}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.detailedAnalysis.experience.gaps && (
                    <div>
                      <span className="font-semibold">Erfarenhets-gap:</span>
                      <ul className="list-disc ml-6 mt-1 text-slate-700">
                        {result.detailedAnalysis.experience.gaps.map((g: string, idx: number) => (
                          <li key={idx}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.detailedAnalysis.education && (
                    <div>
                      <div className="font-semibold">Utbildning (nivå): {result.detailedAnalysis.education.matchLevel}</div>
                      {result.detailedAnalysis.education.details && (
                        <div>
                          <span className="font-semibold">Utbildningsdetaljer:</span>
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
                      <div className="font-semibold">Mjuka färdigheter (nivå): {result.detailedAnalysis.softSkills.matchLevel}</div>
                      {result.detailedAnalysis.softSkills.evidence && (
                        <div>
                          <span className="font-semibold">Bevis på mjuka färdigheter:</span>
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
                  <div className="font-bold mt-4 mb-2">Rekommendationer</div>
                  {result.actionableRecommendations.cvImprovements && (
                    <div>
                      <span className="font-semibold">CV-förbättringar:</span>
                      <ul className="list-disc ml-6 mt-1 text-slate-700">
                        {result.actionableRecommendations.cvImprovements.map((c: string, idx: number) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.actionableRecommendations.skillDevelopment && (
                    <div>
                      <span className="font-semibold">Kompetensutveckling:</span>
                      <ul className="list-disc ml-6 mt-1 text-slate-700">
                        {result.actionableRecommendations.skillDevelopment.map((s: string, idx: number) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.actionableRecommendations.interviewPreparation && (
                    <div>
                      <span className="font-semibold">Intervjuförberedelser:</span>
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
                  <span className="font-semibold">Nästa steg:</span>
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
              <h3 className="font-bold mb-2">AI-analys:</h3>
              <pre className="whitespace-pre-wrap text-sm">{result}</pre>
            </div>
          ) : null}
        </div>
      </PageWrapper>
    </>
  );
};

export default CompareCvToJobAdPage;

