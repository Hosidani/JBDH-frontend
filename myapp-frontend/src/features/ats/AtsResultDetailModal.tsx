import React, { useState, useEffect } from 'react';
import { Modal, Section, BulletList, FieldAnalysisCard } from '../../components/common';
import { useTranslation } from '../../hooks/TranslationProvider';
import type { SseAnalysisResult, Bilingual } from '../../types/analysis';
import { parseJobName } from '../../utils/parseJobName';
import { useSSE } from '../../hooks/useSSE';
import { structureCV, analyzeJob, matchJobStructured, matchPortrait } from '../../ai/ai';
import type { MatchResult, StructuredCV, SeekerProfile } from '../../ai/ai';
import { LocalDbService } from '../../db/LocalDbService';
import noWayImg     from '../../assets/graphics/NoWay.png';
import poorImg      from '../../assets/graphics/Poor.png';
import notLikelyImg from '../../assets/graphics/NotLikely.png';
import fairImg      from '../../assets/graphics/Fair.png';
import excelentImg  from '../../assets/graphics/Excelent.png';

interface AtsJson {
  total_score?: number;
  overall_score?: number;
  breakdown?: Record<string, number>;
  matched_skills?: string[];
  missing_skills?: string[];
  bonus_skills?: string[];
  recommendations?: string[];
}

export interface AtsResultDetail {
  id: number;
  cv_name: string;
  job_name: string;
  overall_score: number | null;
  created_at: string;
  cv_text: string;
  job_text: string;
  ats_json: AtsJson;
}

interface Props {
  open: boolean;
  result: AtsResultDetail | null;
  onClose: () => void;
}

function scoreImage(score: number): string {
  if (score <= 25) return noWayImg;
  if (score <= 55) return poorImg;
  if (score <= 74) return notLikelyImg;
  if (score <= 86) return fairImg;
  return excelentImg;
}

function scoreLabelKey(score: number): string {
  if (score <= 25) return 'ats_score_no_way';
  if (score <= 55) return 'ats_score_poor';
  if (score <= 74) return 'ats_score_not_likely';
  if (score <= 86) return 'ats_score_fair';
  return 'ats_score_excellent';
}

function SkillPill({ label, variant }: { label: string; variant: 'green' | 'red' | 'blue' }) {
  const cls =
    variant === 'green' ? 'bg-green-100 text-green-800' :
    variant === 'red'   ? 'bg-red-100 text-red-800' :
    'bg-blue-100 text-blue-800';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
}

type LlmStep = 'idle' | 'structuring-cv' | 'analyzing-job' | 'matching' | 'done' | 'error';

interface RecsPopupProps {
  text: string;
  onClose: () => void;
}

function RecsPopup({ text, onClose }: RecsPopupProps) {
  const { tSync } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col gap-4 p-6 z-10">
        <h3 className="text-base font-semibold text-slate-700">{tSync('ats_detail_recommendations')}</h3>
        <textarea
          readOnly
          value={text}
          rows={6}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 resize-none focus:outline-none"
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleCopy}
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {copied ? tSync('ats_recs_copied') : tSync('ats_recs_copy')}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            {tSync('button_ok')}
          </button>
        </div>
      </div>
    </div>
  );
}

function MatchResultSection({ result: r, title }: { result: MatchResult; title: string }) {
  const { tSync } = useTranslation();
  return (
    <section className="border-t border-slate-200 pt-5">
      <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">{title}</h3>
      <div className="flex items-center gap-6 mb-5">
        <div className="flex flex-col items-center flex-shrink-0">
          <img src={scoreImage(r.overall_score)} alt={tSync(scoreLabelKey(r.overall_score))} className="w-32 h-auto object-contain" />
          <span className="text-lg font-bold text-slate-700 -mt-1">{r.overall_score}</span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">{r.summary}</p>
      </div>
      {r.skills.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{tSync('llm_match_skills')}</p>
          <div className="flex flex-col gap-1.5">
            {r.skills.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-24 bg-slate-100 rounded-full h-1.5 flex-shrink-0">
                  <div className={`h-1.5 rounded-full ${s.score >= 75 ? 'bg-green-500' : s.score >= 50 ? 'bg-yellow-400' : 'bg-orange-400'}`} style={{ width: `${s.score}%` }} />
                </div>
                <span className="text-xs font-medium text-slate-700 w-28 flex-shrink-0 truncate">{s.skill_name}</span>
                {s.is_required && <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 flex-shrink-0">{tSync('llm_match_required')}</span>}
                <span className="text-xs text-slate-500 truncate">{s.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {(r.missing_required_skills.length > 0 || r.missing_nice_to_have_skills.length > 0) && (
        <div className="mb-4 flex flex-wrap gap-4">
          {r.missing_required_skills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{tSync('llm_match_missing_required')}</p>
              <div className="flex flex-wrap gap-1">
                {r.missing_required_skills.map(s => <span key={s} className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">{s}</span>)}
              </div>
            </div>
          )}
          {r.missing_nice_to_have_skills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{tSync('llm_match_missing_nice')}</p>
              <div className="flex flex-wrap gap-1">
                {r.missing_nice_to_have_skills.map(s => <span key={s} className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">{s}</span>)}
              </div>
            </div>
          )}
        </div>
      )}
      {r.experiences.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{tSync('llm_match_experiences')}</p>
          <div className="flex flex-col gap-1.5">
            {r.experiences.map((e, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-24 bg-slate-100 rounded-full h-1.5 flex-shrink-0">
                  <div className={`h-1.5 rounded-full ${e.score >= 75 ? 'bg-green-500' : e.score >= 50 ? 'bg-yellow-400' : 'bg-orange-400'}`} style={{ width: `${e.score}%` }} />
                </div>
                <span className="text-xs text-slate-400 w-12 flex-shrink-0">{e.id}</span>
                <span className="text-xs text-slate-600 truncate">{e.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {(r.matching_personal_qualities.length > 0 || r.missing_personal_qualities.length > 0) && (
        <div className="flex flex-wrap gap-4">
          {r.matching_personal_qualities.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{tSync('llm_match_personal_qualities_match')}</p>
              <div className="flex flex-wrap gap-1">
                {r.matching_personal_qualities.map(q => <span key={q} className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">{q}</span>)}
              </div>
            </div>
          )}
          {r.missing_personal_qualities.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{tSync('llm_match_personal_qualities_missing')}</p>
              <div className="flex flex-wrap gap-1">
                {r.missing_personal_qualities.map(q => <span key={q} className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{q}</span>)}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

const AtsResultDetailModal: React.FC<Props> = ({ open, result, onClose }) => {
  const { tSync, language } = useTranslation();
  const [recsPopupOpen, setRecsPopupOpen] = useState(false);
  const [sseFormData, setSseFormData] = useState<FormData | null>(null);
  const [sseProgress, setSseProgress] = useState<{ progress: number } | null>(null);
  const [sseMessages, setSseMessages] = useState<string[]>([]);
  const [sseError, setSseError] = useState<string | null>(null);

  // LLM match state
  const [llmStep, setLlmStep] = useState<LlmStep>('idle');
  const [llmResult, setLlmResult] = useState<MatchResult | null>(null);
  const [llmError, setLlmError] = useState<string | null>(null);

  // SSE analysis result (shown inline instead of navigating away)
  const [sseResult, setSseResult] = useState<SseAnalysisResult | null>(null);

  // Portrait match state
  const [portraitLoading, setPortraitLoading] = useState(false);
  const [portraitResult, setPortraitResult] = useState<MatchResult | null>(null);
  const [portraitError, setPortraitError] = useState<string | null>(null);

  // Header display state
  const [headerCandidateName, setHeaderCandidateName] = useState<string | null>(null);
  const [headerJobCompany, setHeaderJobCompany] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSseFormData(null);
      setSseProgress(null);
      setSseMessages([]);
      setSseError(null);
      setLlmStep('idle');
      setLlmResult(null);
      setLlmError(null);
      setPortraitLoading(false);
      setPortraitResult(null);
      setPortraitError(null);
      setSseResult(null);
      setHeaderCandidateName(null);
      setHeaderJobCompany(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !result) return;
    (async () => {
      const [allCvs, allJobs] = await Promise.all([
        LocalDbService.getAllCVs(),
        LocalDbService.getAllJobs(),
      ]);
      const idbCv = allCvs.find(cv => cv.cv_title === result.cv_name);
      if (idbCv?.candidate_id) {
        const candidate = await LocalDbService.getCandidate(idbCv.candidate_id);
        if (candidate) setHeaderCandidateName(candidate.name);
      }
      const idbJob = allJobs.find(j => j.job_description === result.job_text);
      if (idbJob?.job_json) {
        try {
          const structured = JSON.parse(idbJob.job_json);
          if (structured?.job_company) setHeaderJobCompany(structured.job_company);
        } catch { /* skip */ }
      }
    })().catch(() => {});
  }, [open, result]);

  useSSE(
    '/home/CompareCvJobSSE',
    sseFormData,
    (data) => {
      setSseProgress(data);
      if (data.message) setSseMessages(prev => [...prev, data.message!]);
    },
    (res) => {
      setSseProgress(null);
      setSseMessages([]);
      setSseResult(res);
    },
    (err) => {
      setSseError(typeof err === 'string' ? err : tSync('ats_analyze_error'));
      setSseProgress(null);
      setSseMessages([]);
    },
  );

  const resolveText = (value: Bilingual | string | undefined): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return language === 'en' ? (value.en || value.sv) : (value.sv || value.en);
  };

  const handleLlmMatch = async () => {
    if (!result) return;
    setLlmError(null);
    setLlmResult(null);
    try {
      setLlmStep('structuring-cv');

      // Use cached cv_json from IndexedDB if available
      let structuredCv: StructuredCV;
      const allCvs = await LocalDbService.getAllCVs();
      const idbCv = allCvs.find(cv => cv.cv_title === result.cv_name);

      if (idbCv?.cv_json) {
        structuredCv = JSON.parse(idbCv.cv_json) as StructuredCV;
      } else {
        structuredCv = await structureCV(result.cv_text);
        if (idbCv) {
          await LocalDbService.updateCV(idbCv.cv_id, { cv_json: JSON.stringify(structuredCv) });
        }
      }

      // Merge extracted personal qualities into candidate.personal_treats
      if (idbCv?.candidate_id && structuredCv.personal_qualities?.length) {
        const candidate = await LocalDbService.getCandidate(idbCv.candidate_id);
        if (candidate) {
          const merged = [...new Set([...(candidate.personal_treats ?? []), ...structuredCv.personal_qualities])];
          if (merged.length !== (candidate.personal_treats ?? []).length) {
            await LocalDbService.updateCandidate(idbCv.candidate_id, { personal_treats: merged, portrait: '' });
          }
        }
      }

      setLlmStep('analyzing-job');
      const jobTitle = parseJobName(result.job_name ?? '').title || result.job_name || '';
      const allJobs = await LocalDbService.getAllJobs();
      const idbJob = allJobs.find(j => j.job_description === result.job_text);
      let structuredJob: Awaited<ReturnType<typeof analyzeJob>>;
      if (idbJob?.job_json) {
        structuredJob = JSON.parse(idbJob.job_json);
      } else {
        structuredJob = await analyzeJob(jobTitle, result.job_text);
        if (idbJob) {
          await LocalDbService.updateJob(idbJob.job_id, { job_json: JSON.stringify(structuredJob) });
        }
      }

      setLlmStep('matching');
      const experiences = structuredCv.work_experience.map(w => {
        const period = [w.start_date, w.end_date ?? 'nuvarande'].filter(Boolean).join('–');
        return `${w.position ?? '?'} hos ${w.company ?? '?'}${period ? ` (${period})` : ''}`;
      });

      let seekerProfile: SeekerProfile | undefined;
      if (idbCv?.candidate_id) {
        const candidate = await LocalDbService.getCandidate(idbCv.candidate_id);
        if (candidate) {
          seekerProfile = {
            job_title: candidate.title || undefined,
            preferred_city: candidate.location || undefined,
            preferred_workplace: candidate.workplace.length ? candidate.workplace.join(', ') : undefined,
            preferred_employment_type: candidate.employment_type.length ? candidate.employment_type.join(', ') : undefined,
          };
        }
      }

      const matchResult = await matchJobStructured(
        structuredCv.skills,
        experiences,
        structuredJob,
        seekerProfile,
      );
      setLlmResult(matchResult);
      setLlmStep('done');
    } catch (e) {
      setLlmError(e instanceof Error ? e.message : tSync('llm_match_error'));
      setLlmStep('error');
    }
  };

  const handlePortraitMatch = async () => {
    if (!result) return;
    setPortraitLoading(true);
    setPortraitError(null);
    setPortraitResult(null);
    try {
      const allCvs = await LocalDbService.getAllCVs();
      const idbCv = allCvs.find(cv => cv.cv_title === result.cv_name);
      if (!idbCv?.candidate_id) throw new Error('Kandidat saknas i IndexedDB.');
      const candidate = await LocalDbService.getCandidate(idbCv.candidate_id);
      if (!candidate?.portrait) throw new Error('Kandidaten har inget porträtt ännu. Generera ett under kandidatkortet.');
      const matchResult = await matchPortrait(candidate.portrait, result.job_text);
      setPortraitResult(matchResult);
    } catch (e) {
      setPortraitError(e instanceof Error ? e.message : 'Kunde inte matcha porträttet.');
    } finally {
      setPortraitLoading(false);
    }
  };

  const handleAnalyze = () => {
    if (!result) return;
    setSseError(null);
    setSseProgress(null);
    setSseMessages([]);
    const cvBlob = new Blob([result.cv_text], { type: 'text/plain' });
    const cvFile = new File([cvBlob], 'cv.txt', { type: 'text/plain' });
    const fd = new FormData();
    fd.append('CvPath', cvFile);
    fd.append('JobAdText', result.job_text);
    setSseFormData(fd);
  };

  if (!result) {
    return (
      <Modal open={open} onClose={onClose} title="…">
        <div className="flex items-center justify-center py-12 text-sm text-slate-400">
          {tSync('ats_loading')}
        </div>
      </Modal>
    );
  }

  const json = result.ats_json ?? {};
  const score = json.total_score ?? json.overall_score ?? result.overall_score ?? 0;
  const breakdown = json.breakdown ?? {};
  const matched = json.matched_skills ?? [];
  const missing = json.missing_skills ?? [];
  const bonus = json.bonus_skills ?? [];
  const recs = json.recommendations ?? [];
  const recsText = recs.join('\n');
  const analyzing = !!sseProgress;

  return (
    <>
      <Modal open={open} onClose={onClose} maxWidth="max-w-3xl" title={
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-bold text-slate-800 leading-tight">
            {headerCandidateName || result.cv_name}
          </span>
          <span className="text-sm font-normal text-slate-500 leading-tight">
            CV: {result.cv_name}
          </span>
          <span className="text-sm font-normal text-slate-500 leading-tight">
            Jobb: {[parseJobName(result.job_name ?? '').title || result.job_name, headerJobCompany].filter(Boolean).join(', ')}
          </span>
        </div>
      }>
        <div className="flex flex-col gap-6">

          {/* Score image */}
          <div className="flex flex-col items-center gap-2">
            <img
              src={scoreImage(score)}
              alt={tSync(scoreLabelKey(score))}
              className="w-40 h-auto object-contain"
            />
            <span className="text-2xl font-bold text-slate-700">{tSync(scoreLabelKey(score))}</span>
          </div>

          {/* Breakdown */}
          {Object.keys(breakdown).length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                {tSync('ats_detail_breakdown')}
              </h3>
              <div className="flex flex-col gap-2">
                {Object.entries(breakdown).map(([key, val]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs text-slate-600 mb-0.5">
                      <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                      <span>{val != null ? `${Math.round(val as number)}%` : '—'}</span>
                    </div>
                    {val != null ? (
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${Math.min(100, Math.round(val as number))}%` }}
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Ej angivet i jobbannonsen</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {(matched.length > 0 || missing.length > 0 || bonus.length > 0) && (
            <section>
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                {tSync('ats_detail_skills')}
              </h3>
              <div className="flex flex-col gap-2">
                {matched.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{tSync('ats_detail_matched')}</p>
                    <div className="flex flex-wrap gap-1">
                      {matched.map(s => <SkillPill key={s} label={s} variant="green" />)}
                    </div>
                  </div>
                )}
                {missing.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{tSync('ats_detail_missing')}</p>
                    <div className="flex flex-wrap gap-1">
                      {missing.map(s => <SkillPill key={s} label={s} variant="red" />)}
                    </div>
                  </div>
                )}
                {bonus.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{tSync('ats_detail_bonus')}</p>
                    <div className="flex flex-wrap gap-1">
                      {bonus.map(s => <SkillPill key={s} label={s} variant="blue" />)}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Recommendations */}
          {recs.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                {tSync('ats_detail_recommendations')}
              </h3>
              <ul className="flex flex-col gap-1 list-disc list-inside text-sm text-slate-700">
                {recs.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </section>
          )}

          {/* Bottom actions */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              {new Date(result.created_at).toLocaleString('sv-SE')}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {analyzing ? tSync('ats_analyzing') : tSync('ats_analyze')}
              </button>
              <button
                onClick={handleLlmMatch}
                disabled={llmStep !== 'idle' && llmStep !== 'done' && llmStep !== 'error'}
                className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                {llmStep === 'structuring-cv' ? tSync('llm_match_loading_cv') :
                 llmStep === 'analyzing-job'  ? tSync('llm_match_loading_job') :
                 llmStep === 'matching'        ? tSync('llm_match_loading_match') :
                                                tSync('llm_match_button')}
              </button>
              <button
                onClick={handlePortraitMatch}
                disabled={portraitLoading}
                className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {portraitLoading ? '…' : 'Matcha porträtt'}
              </button>
              {recs.length > 0 && (
                <button
                  onClick={() => setRecsPopupOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {tSync('ats_recs_send')}
                </button>
              )}
            </div>
          </div>

          {/* SSE progress */}
          {sseProgress && (
            <div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mb-2">
                <div
                  className="h-3 bg-gradient-to-r from-blue-600 via-green-500 to-yellow-400 transition-all"
                  style={{ width: `${sseProgress.progress}%` }}
                />
              </div>
              <ul className="text-xs space-y-0.5 mt-1">
                {sseMessages.map((msg, i) => (
                  <li key={i} className={i === sseMessages.length - 1 ? 'font-semibold text-slate-700' : 'text-slate-400'}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          {/* SSE error */}
          {sseError && (
            <p className="text-sm text-red-600">{sseError}</p>
          )}

          {/* LLM match error */}
          {llmStep === 'error' && llmError && (
            <p className="text-sm text-red-600">{llmError}</p>
          )}

          {/* LLM match result */}
          {llmResult && <MatchResultSection result={llmResult} title={tSync('llm_match_title')} />}

          {/* Portrait match error */}
          {portraitError && (
            <p className="text-sm text-red-600">{portraitError}</p>
          )}

          {/* Portrait match result */}
          {portraitResult && <MatchResultSection result={portraitResult} title="Porträttmatchning" />}

          {/* SSE analysis result (inline) */}
          {sseResult && (
            <section className="border-t border-slate-200 pt-5 flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                {language === 'en' ? 'AI Analysis' : 'AI-analys'}
              </h3>

              {sseResult.field_analysis && (
                <FieldAnalysisCard fieldAnalysis={sseResult.field_analysis} lang={language} />
              )}

              {typeof sseResult.skills_vector_similarity === 'number' && (
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border-l-4 border-emerald-400">
                  <span className="text-3xl font-black text-emerald-700">
                    {Number(sseResult.skills_vector_similarity).toFixed(1)}%
                  </span>
                  <span className="ml-3 text-slate-700 font-semibold text-sm">
                    {language === 'en' ? 'Competency similarity' : 'Kompetenslikhet (CV vs Jobbannons)'}
                  </span>
                </div>
              )}

              {sseResult.summary && (
                <Section title={language === 'en' ? 'Summary' : 'Sammanfattning'}>
                  <p className="text-gray-800 bg-blue-50 rounded p-3 border border-blue-100 text-sm">
                    {resolveText(sseResult.summary)}
                  </p>
                </Section>
              )}

              {sseResult.matching_skills?.length > 0 && (
                <Section title={language === 'en' ? 'Matching skills' : 'Matchande kompetenser'}>
                  <BulletList items={sseResult.matching_skills} />
                </Section>
              )}

              {sseResult.missing_requirements?.length > 0 && (
                <Section title={language === 'en' ? 'Missing requirements' : 'Saknade krav'}>
                  <BulletList items={sseResult.missing_requirements} />
                </Section>
              )}

              {sseResult.relevant_experiences?.length > 0 && (
                <Section title={language === 'en' ? 'Relevant experiences' : 'Relevanta erfarenheter'}>
                  <BulletList items={sseResult.relevant_experiences} />
                </Section>
              )}

              {sseResult.education_and_certifications?.length > 0 && (
                <Section title={language === 'en' ? 'Education & certifications' : 'Utbildning & certifieringar'}>
                  <BulletList items={sseResult.education_and_certifications} />
                </Section>
              )}

              {sseResult.strengths?.length > 0 && (
                <Section title={language === 'en' ? 'Strengths' : 'Styrkor'}>
                  <ul className="list-disc ml-6 text-gray-900 space-y-1 text-sm">
                    {sseResult.strengths.map((item, i) => <li key={i}>{resolveText(item)}</li>)}
                  </ul>
                </Section>
              )}

              {sseResult.gaps?.length > 0 && (
                <Section title={language === 'en' ? 'Gaps' : 'Luckor'}>
                  <ul className="list-disc ml-6 text-gray-900 space-y-1 text-sm">
                    {sseResult.gaps.map((item, i) => <li key={i}>{resolveText(item)}</li>)}
                  </ul>
                </Section>
              )}
            </section>
          )}

        </div>
      </Modal>

      {recsPopupOpen && (
        <RecsPopup
          text={recsText}
          onClose={() => setRecsPopupOpen(false)}
        />
      )}
    </>
  );
};

export default AtsResultDetailModal;
