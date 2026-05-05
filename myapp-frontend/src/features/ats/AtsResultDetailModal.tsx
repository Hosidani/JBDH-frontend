import React from 'react';
import { Modal } from '../../components/common';
import { useTranslation } from '../../hooks/TranslationProvider';

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

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 75 ? 'text-green-600 border-green-400' :
    score >= 50 ? 'text-yellow-600 border-yellow-400' :
    'text-red-600 border-red-400';
  return (
    <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-3xl font-bold ${color}`}>
      {Math.round(score)}%
    </div>
  );
}

function SkillPill({ label, variant }: { label: string; variant: 'green' | 'red' | 'blue' }) {
  const cls =
    variant === 'green' ? 'bg-green-100 text-green-800' :
    variant === 'red'   ? 'bg-red-100 text-red-800' :
    'bg-blue-100 text-blue-800';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
}

const AtsResultDetailModal: React.FC<Props> = ({ open, result, onClose }) => {
  const { tSync } = useTranslation();

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

  return (
    <Modal open={open} onClose={onClose} title={`${result.cv_name || tSync('ats_unknown_cv')} → ${result.job_name || tSync('ats_unknown_job')}`}>
      <div className="flex flex-col gap-6">

        {/* Score */}
        <div className="flex flex-col items-center gap-1">
          <ScoreBadge score={score} />
          <span className="text-sm text-slate-500">{tSync('ats_detail_score_label')}</span>
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

        <p className="text-xs text-slate-400 text-right">
          {new Date(result.created_at).toLocaleString('sv-SE')}
        </p>
      </div>
    </Modal>
  );
};

export default AtsResultDetailModal;
