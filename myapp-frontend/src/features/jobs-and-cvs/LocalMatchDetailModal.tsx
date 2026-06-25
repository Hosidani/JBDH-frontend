import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common';
import { Button } from '../../components/ui/Button';
import { AiIcon } from '../../components/ui/AiIcon';
import { ScoreMeter } from '../../components/ui/ScoreMeter';
import { useTranslation } from '../../hooks/TranslationProvider';
import { useLlmReady } from '../../hooks/useLlmReady';
import { matchPortrait, generatePitch } from '../../ai/ai';
import type { MatchResult } from '../../ai/ai';
import type { Match } from '../../db/types';
import { LocalDbService } from '../../db/LocalDbService';

interface Props {
  open: boolean;
  onClose: () => void;
  cvId: string;
  jobId: string;
  cvName: string;
  jobName: string;
  candidateName?: string;
  jobCompany?: string;
  match: Match | null;
  onRematch?: () => void;
  rematching?: boolean;
}

function MatchBlock({ result, title }: { result: MatchResult; title: string }) {
  const { tSync } = useTranslation();
  return (
    <section className="border-t border-slate-200 pt-5 flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{title}</h3>

      <div className="flex flex-col gap-3">
        <ScoreMeter score={result.overall_score} />
        <p className="text-sm text-slate-700 leading-relaxed">{result.summary}</p>
      </div>

      {result.skills.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            {tSync('llm_match_skills')}
          </p>
          <div className="flex flex-col gap-1.5">
            {result.skills.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-24 bg-slate-100 rounded-full h-1.5 flex-shrink-0 mt-1.5">
                  <div
                    className={`h-1.5 rounded-full ${s.score >= 75 ? 'bg-green-500' : s.score >= 50 ? 'bg-yellow-400' : 'bg-orange-400'}`}
                    style={{ width: `${s.score}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-700 w-28 flex-shrink-0 truncate">{s.skill_name}</span>
                {s.is_required && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 flex-shrink-0">
                    {tSync('llm_match_required')}
                  </span>
                )}
                <span className="text-xs text-slate-500">{s.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(result.missing_required_skills.length > 0 || result.missing_nice_to_have_skills.length > 0) && (
        <div className="flex flex-wrap gap-4">
          {result.missing_required_skills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {tSync('llm_match_missing_required')}
              </p>
              <div className="flex flex-wrap gap-1">
                {result.missing_required_skills.map(s => (
                  <span key={s} className="px-2 py-0.5 rounded-sm text-xs font-medium bg-red-100 text-red-700">{s}</span>
                ))}
              </div>
            </div>
          )}
          {result.missing_nice_to_have_skills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {tSync('llm_match_missing_nice')}
              </p>
              <div className="flex flex-wrap gap-1">
                {result.missing_nice_to_have_skills.map(s => (
                  <span key={s} className="px-2 py-0.5 rounded-sm text-xs font-medium bg-orange-100 text-orange-700">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {result.experiences.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            {tSync('llm_match_experiences')}
          </p>
          <div className="flex flex-col gap-1.5">
            {result.experiences.map((e, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-24 bg-slate-100 rounded-full h-1.5 flex-shrink-0 mt-1.5">
                  <div
                    className={`h-1.5 rounded-full ${e.score >= 75 ? 'bg-green-500' : e.score >= 50 ? 'bg-yellow-400' : 'bg-orange-400'}`}
                    style={{ width: `${e.score}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-12 flex-shrink-0">{e.id}</span>
                <span className="text-xs text-slate-600">{e.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(result.matching_personal_qualities.length > 0 || result.missing_personal_qualities.length > 0) && (
        <div className="flex flex-wrap gap-4">
          {result.matching_personal_qualities.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {tSync('llm_match_personal_qualities_match')}
              </p>
              <div className="flex flex-wrap gap-1">
                {result.matching_personal_qualities.map(q => (
                  <span key={q} className="px-2 py-0.5 rounded-sm text-xs font-medium bg-green-100 text-green-700">{q}</span>
                ))}
              </div>
            </div>
          )}
          {result.missing_personal_qualities.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {tSync('llm_match_personal_qualities_missing')}
              </p>
              <div className="flex flex-wrap gap-1">
                {result.missing_personal_qualities.map(q => (
                  <span key={q} className="px-2 py-0.5 rounded-sm text-xs font-medium bg-slate-100 text-slate-600">{q}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

const LocalMatchDetailModal: React.FC<Props> = ({
  open, onClose, cvId, jobId, cvName, jobName, candidateName, jobCompany, match, onRematch, rematching,
}) => {
  const { tSync } = useTranslation();
  const llmReady = useLlmReady();

  // Portrait existence — null while checking, true/false once resolved
  const [hasPortrait, setHasPortrait] = useState<boolean | null>(null);

  const [portraitLoading, setPortraitLoading] = useState(false);
  const [portraitResult, setPortraitResult]   = useState<MatchResult | null>(null);
  const [portraitError,  setPortraitError]    = useState<string | null>(null);

  const [pitchLoading, setPitchLoading] = useState(false);
  const [pitchResult,  setPitchResult]  = useState<string | null>(null);
  const [pitchError,   setPitchError]   = useState<string | null>(null);
  const [pitchCopied,  setPitchCopied]  = useState(false);

  // Check portrait existence when modal opens
  useEffect(() => {
    if (!open) {
      setHasPortrait(null);
      setPortraitResult(null);
      setPortraitError(null);
      setPitchResult(null);
      setPitchError(null);
      setPitchCopied(false);
      return;
    }
    (async () => {
      try {
        const idbCv = await LocalDbService.getCV(cvId);
        if (!idbCv?.candidate_id) { setHasPortrait(false); return; }
        const candidate = await LocalDbService.getCandidate(idbCv.candidate_id);
        setHasPortrait(!!candidate?.portrait);
      } catch {
        setHasPortrait(false);
      }
    })();
  }, [open, cvId]);

  const handlePortraitMatch = async () => {
    setPortraitLoading(true);
    setPortraitError(null);
    setPortraitResult(null);
    try {
      const idbCv = await LocalDbService.getCV(cvId);
      if (!idbCv?.candidate_id) throw new Error(tSync('llm_portrait_no_portrait'));
      const candidate = await LocalDbService.getCandidate(idbCv.candidate_id);
      if (!candidate?.portrait) throw new Error(tSync('llm_portrait_no_portrait'));
      const idbJob = await LocalDbService.getJob(jobId);
      if (!idbJob?.job_description) throw new Error('Jobbannons saknar text.');
      const result = await matchPortrait(candidate.portrait, idbJob.job_description);
      setPortraitResult(result);
    } catch (e) {
      setPortraitError(e instanceof Error ? e.message : 'Kunde inte matcha porträttet.');
    } finally {
      setPortraitLoading(false);
    }
  };

  const handlePitch = async () => {
    setPitchLoading(true);
    setPitchError(null);
    setPitchResult(null);
    try {
      const idbCv = await LocalDbService.getCV(cvId);
      if (!idbCv) throw new Error('CV saknas i IndexedDB.');
      const idbJob = await LocalDbService.getJob(jobId);
      if (!idbJob?.job_description) throw new Error('Jobbannons saknar text.');

      let candidate = null;
      let allCandidateCvs = [idbCv];
      if (idbCv.candidate_id) {
        candidate = await LocalDbService.getCandidate(idbCv.candidate_id);
        allCandidateCvs = await LocalDbService.getCVsForCandidate(idbCv.candidate_id);
      }

      let jobTitle = jobName;
      if (idbJob.job_json) {
        try {
          const structured = JSON.parse(idbJob.job_json);
          if (structured?.job_title) jobTitle = structured.job_title;
        } catch { /* use fallback */ }
      }

      const pitch = await generatePitch({
        candidateTitle: candidate?.title || undefined,
        personalQualities: candidate?.personal_qualities ?? [],
        portrait: candidate?.portrait || undefined,
        cvTexts: allCandidateCvs.map(cv => cv.cv_anonymized).filter(Boolean) as string[],
        jobTitle,
        jobDescription: idbJob.job_description,
      });
      setPitchResult(pitch.trim());
    } catch (e) {
      setPitchError(e instanceof Error ? e.message : tSync('pitch_error'));
    } finally {
      setPitchLoading(false);
    }
  };

  let mainResult: MatchResult | null = null;
  if (match?.match_json) {
    try { mainResult = JSON.parse(match.match_json) as MatchResult; } catch { /* skip */ }
  }

  const matchedAt = match?.matched_at
    ? new Date(match.matched_at).toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' })
    : null;

  // Portrait button tooltip: specifik message based on reason disabled
  const portraitTooltip = !llmReady
    ? tSync('llm_requires_provider')
    : hasPortrait === false
    ? tSync('llm_portrait_no_portrait')
    : undefined;

  const portraitDisabled = !llmReady || portraitLoading || hasPortrait === false;

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth="max-w-3xl"
      title={
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-bold text-slate-800 leading-tight">
            {candidateName ?? cvName}
          </span>
          {candidateName && (
            <span className="text-sm font-normal text-slate-500 leading-tight">CV: {cvName}</span>
          )}
          <span className="text-sm font-normal text-slate-500 leading-tight">
            Jobb: {[jobCompany, jobName].filter(Boolean).join(', ')}
          </span>
        </div>
      }
    >
      {matchedAt && (
        <p className="text-xs text-slate-400 mb-5">{tSync('llm_match_title')} · {matchedAt}</p>
      )}

      {mainResult ? (
        <div className="flex flex-col gap-5">

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handlePortraitMatch}
              disabled={portraitDisabled}
              title={portraitTooltip}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AiIcon className="w-4 h-4 text-white" />
              {portraitLoading ? '…' : tSync('llm_portrait_btn')}
            </button>

            <button
              onClick={handlePitch}
              disabled={!llmReady || pitchLoading}
              title={!llmReady ? tSync('llm_requires_provider') : undefined}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AiIcon className="w-4 h-4 text-white" />
              {pitchLoading ? tSync('pitch_loading') : tSync('pitch_btn')}
            </button>

            {onRematch && (
              <Button variant="primary" size="lg" loading={rematching} onClick={onRematch}>
                <AiIcon className="w-4 h-4 text-white mr-2" />
                {tSync('jac_rematch_btn')}
              </Button>
            )}
          </div>


          {/* Main AI match result */}
          <MatchBlock result={mainResult} title={tSync('llm_match_title')} />

          {/* Portrait match error */}
          {portraitError && (
            <p className="text-sm text-red-600 border-t border-slate-200 pt-4">{portraitError}</p>
          )}

          {/* Portrait match result */}
          {portraitResult && (
            <MatchBlock result={portraitResult} title={tSync('llm_portrait_title')} />
          )}

          {/* Pitch error */}
          {pitchError && (
            <p className="text-sm text-red-600 border-t border-slate-200 pt-4">{pitchError}</p>
          )}

          {/* Pitch result */}
          {pitchResult && (
            <section className="border-t border-slate-200 pt-5">
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
                {tSync('pitch_title')}
              </h3>
              <div className="relative rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 pr-24">
                <p className="text-sm text-slate-800 leading-relaxed">{pitchResult}</p>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(pitchResult);
                    setPitchCopied(true);
                    setTimeout(() => setPitchCopied(false), 2000);
                  }}
                  className="absolute top-3 right-3 text-xs font-semibold px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-amber-700 hover:bg-amber-100 transition-colors"
                >
                  {pitchCopied ? tSync('pitch_copied') : tSync('pitch_copy')}
                </button>
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-6">
          {llmReady ? (
            <>
              <p className="text-sm text-slate-500 text-center">{tSync('llm_no_match_yet')}</p>
              {onRematch && (
                <Button variant="primary" size="lg" loading={rematching} onClick={onRematch}>
                  <AiIcon className="w-4 h-4 text-white mr-2" />
                  {tSync('jac_ai_match_btn')}
                </Button>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-400 text-center">{tSync('llm_requires_provider')}</p>
          )}
        </div>
      )}
    </Modal>
  );
};

export default LocalMatchDetailModal;
