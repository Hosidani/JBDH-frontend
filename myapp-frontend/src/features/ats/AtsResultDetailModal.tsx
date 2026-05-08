import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../components/common';
import { useTranslation } from '../../hooks/TranslationProvider';
import { useSSE } from '../../hooks/useSSE';
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

const AtsResultDetailModal: React.FC<Props> = ({ open, result, onClose }) => {
  const { tSync } = useTranslation();
  const navigate = useNavigate();
  const [recsPopupOpen, setRecsPopupOpen] = useState(false);
  const [sseFormData, setSseFormData] = useState<FormData | null>(null);
  const [sseProgress, setSseProgress] = useState<{ progress: number; message?: string; vectorResult?: any } | null>(null);
  const [sseError, setSseError] = useState<string | null>(null);
  const vectorResultRef = useRef<any>(null);

  useEffect(() => {
    if (!open) {
      setSseFormData(null);
      setSseProgress(null);
      setSseError(null);
      vectorResultRef.current = null;
    }
  }, [open]);

  useSSE(
    '/home/CompareCvJobSSE',
    sseFormData,
    (data) => {
      setSseProgress(data);
      if (data.vectorResult) { vectorResultRef.current = data.vectorResult; }
    },
    (res) => {
      setSseProgress(null);
      onClose();
      navigate('/ai-analysis-result', {
        state: {
          sseResult: res,
          vectorResult: vectorResultRef.current,
          title: `${result?.cv_name || ''} → ${result?.job_name || ''}`.trim(),
        },
      });
    },
    (err) => {
      setSseError(typeof err === 'string' ? err : tSync('ats_analyze_error'));
      setSseProgress(null);
    },
  );

  const handleAnalyze = () => {
    if (!result) return;
    setSseError(null);
    setSseProgress(null);
    vectorResultRef.current = null;
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
      <Modal open={open} onClose={onClose} maxWidth="max-w-3xl" title={`${result.cv_name || tSync('ats_unknown_cv')} → ${result.job_name || tSync('ats_unknown_job')}`}>
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
              <p className="text-xs text-slate-500">{sseProgress.message}</p>
            </div>
          )}

          {/* SSE error */}
          {sseError && (
            <p className="text-sm text-red-600">{sseError}</p>
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
