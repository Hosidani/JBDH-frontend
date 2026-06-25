import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageBackground, PageWrapper, Modal } from '../../components/common';
import { PageCard } from '../../components/common/PageCard';
import { Button } from '../../components/ui/Button';
import { NamePill } from '../../components/common/NamePill';
import { AiIcon } from '../../components/ui/AiIcon';
import { ApiService } from '../../services/ApiService';
import { useTranslation } from '../../hooks/TranslationProvider';
import { useLlmReady } from '../../hooks/useLlmReady';
import { parseJobName } from '../../utils/parseJobName';
import type { StructuredJob, MatchResult, StructuredCV, SeekerProfile } from '../../ai/ai';
import { structureCV, analyzeJob, matchJobStructured } from '../../ai/ai';
import { useAuth } from '../../context/AuthContext';
import { useLocalAccountContext } from '../../context/LocalAccountContext';
import { LocalDbService } from '../../db/LocalDbService';
import type { Match } from '../../db/types';
import { Icon } from '../../components/ui/Icon';
import AtsResultDetailModal, { type AtsResultDetail } from '../ats/AtsResultDetailModal';
import LocalMatchDetailModal from './LocalMatchDetailModal';
import coffeBreakImg from '../../assets/img/Coffe-break.png';
import noWayImg from '../../assets/graphics/NoWay.png';
import poorImg from '../../assets/graphics/Poor.png';
import notLikelyImg from '../../assets/graphics/NotLikely.png';
import fairImg from '../../assets/graphics/Fair.png';
import excelentImg from '../../assets/graphics/Excelent.png';

// ─── types ────────────────────────────────────────────────────────────────────

interface CvItem {
  id: string;             // IDB cv_id UUID
  name: string;           // cv_title or truncated cv_anonymized
  text: string;           // cv_anonymized
  candidateName?: string;
}
interface JobItem {
  id: string;             // IDB job_id UUID
  displayName: string;    // job_title or truncated description
  channel?: string;
  text: string;           // job_description
  company?: string;
  applyLatest?: string;
  domain?: string;
}
interface AtsResult {
  id: number;
  cv_name: string;
  job_name: string;
  overall_score: number | null;
  created_at: string;
}
interface CompactRow {
  primaryLine: string;
  secondaryLine: string;
  atsScore: number | null;
  atsResultId?: number;
  aiScore: number | null;
  cvId?: string;
  jobId?: string;
}
type TabId = 'cvs-jobs' | 'jobs-cvs' | 'scores' | 'graphical';

// ─── helpers ──────────────────────────────────────────────────────────────────

function scoreImage(score: number): string {
  if (score <= 25) return noWayImg;
  if (score <= 55) return poorImg;
  if (score <= 74) return notLikelyImg;
  if (score <= 86) return fairImg;
  return excelentImg;
}

const FunnelIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
    <path fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z" clipRule="evenodd" />
  </svg>
);

// ─── FilterModal ──────────────────────────────────────────────────────────────

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  items: { id: string; label: string }[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  selectAllLabel: string;
  deselectAllLabel: string;
  onDeleteItem?: (id: string) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  open, onClose, title, items, selected, onChange, selectAllLabel, deselectAllLabel, onDeleteItem,
}) => {
  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    onChange(next);
  };
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex gap-2 mb-3">
        <Button variant="secondary" size="sm" onClick={() => onChange(new Set(items.map(i => i.id)))}>{selectAllLabel}</Button>
        <Button variant="secondary" size="sm" onClick={() => onChange(new Set())}>{deselectAllLabel}</Button>
      </div>
      <ul className="flex flex-col gap-0.5 max-h-72 overflow-y-auto">
        {items.map(item => (
          <li key={item.id} className="group flex items-center gap-1 py-1.5 px-2 hover:bg-slate-50 rounded-md">
            <label className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer text-sm text-slate-700">
              <input
                type="checkbox"
                checked={selected.has(item.id)}
                onChange={() => toggle(item.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
              />
              <span className="truncate">{item.label}</span>
            </label>
            {onDeleteItem && (
              <button
                onClick={() => onDeleteItem(item.id)}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                title="Ta bort"
              >
                <Icon name="delete" size={16} />
              </button>
            )}
          </li>
        ))}
      </ul>
      <div className="flex justify-end mt-4">
        <Button variant="primary" size="lg" onClick={onClose}>OK</Button>
      </div>
    </Modal>
  );
};

// ─── CompactTable ─────────────────────────────────────────────────────────────

const CompactTable: React.FC<{
  rows: CompactRow[];
  emptyLabel: string;
  sortByScore?: boolean;
  onRowClick?: (id: number) => void;
  onLocalMatchClick?: (cvId: string, jobId: string) => void;
  onAiMatch?: (cvId: string, jobId: string) => void;
  matchingPairs?: Set<string>;
  llmReady?: boolean;
  showAts?: boolean;
  aiMatchLabel: string;
  aiMatchingLabel: string;
}> = ({ rows, emptyLabel, sortByScore = false, onRowClick, onLocalMatchClick, onAiMatch, matchingPairs, llmReady, showAts = false, aiMatchLabel, aiMatchingLabel }) => {
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(sortByScore ? 'desc' : 'asc');

  useEffect(() => { setSortDir(sortByScore ? 'desc' : 'asc'); }, [sortByScore]);

  const sorted = useMemo(() => [...rows].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortByScore) {
      const sa = Math.max(a.atsScore ?? -Infinity, a.aiScore ?? -Infinity);
      const sb = Math.max(b.atsScore ?? -Infinity, b.aiScore ?? -Infinity);
      return (sa - sb) * dir;
    }
    return a.primaryLine.localeCompare(b.primaryLine, 'sv') * dir;
  }), [rows, sortDir, sortByScore]);

  if (rows.length === 0) return <p className="text-sm text-slate-400 text-center py-6">{emptyLabel}</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th
              className="text-left text-slate-500 font-semibold pb-2 pr-4 cursor-pointer select-none hover:text-blue-600 transition-colors"
              onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
            >
              {sortDir === 'asc' ? '▲' : '▼'}
            </th>
            {showAts && (
              <th className="text-center text-slate-500 font-semibold pb-2 w-20 text-xs">ATS</th>
            )}
            <th className="text-center text-slate-500 font-semibold pb-2 w-24 text-xs">
              <span className="inline-flex items-center gap-1"><AiIcon className="w-3 h-3 text-slate-400" />AI</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const pairKey = row.cvId && row.jobId ? `${row.cvId}|${row.jobId}` : undefined;
            const isMatching = pairKey ? matchingPairs?.has(pairKey) : false;
            return (
              <tr key={i} className="border-t border-slate-100">
                <td
                  className={[
                    'py-2 pr-4',
                    ((row.cvId && row.jobId) || row.atsResultId != null)
                      ? 'cursor-pointer hover:bg-slate-50 rounded-sm transition-colors'
                      : '',
                  ].join(' ')}
                  onClick={() => {
                    if (row.cvId && row.jobId) onLocalMatchClick?.(row.cvId, row.jobId);
                    else if (row.atsResultId != null) onRowClick?.(row.atsResultId);
                  }}
                >
                  <div className="min-w-0">
                    <p className="text-slate-700 font-medium leading-tight truncate">{row.primaryLine}</p>
                    <p className="text-slate-400 text-xs leading-tight truncate">{row.secondaryLine}</p>
                  </div>
                </td>

                {/* ATS score column */}
                {showAts && (
                  <td className="py-1.5 text-center">
                    {row.atsScore != null && row.atsResultId != null ? (
                      <button
                        onClick={() => onRowClick?.(row.atsResultId!)}
                        className="inline-flex flex-col items-center hover:opacity-75 transition-opacity"
                        title={`ATS: ${Math.round(row.atsScore)}%`}
                      >
                        <img src={scoreImage(row.atsScore)} alt={`${Math.round(row.atsScore)}%`} className="h-7 w-auto object-contain" />
                        <span className="text-[10px] text-slate-400">{Math.round(row.atsScore)}%</span>
                      </button>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                )}

                {/* AI score column */}
                <td className="py-1.5 text-center">
                  {row.aiScore != null && row.cvId && row.jobId ? (
                    <button
                      onClick={() => onLocalMatchClick?.(row.cvId!, row.jobId!)}
                      className="inline-flex flex-col items-center hover:opacity-75 transition-opacity"
                      title={`AI: ${Math.round(row.aiScore)}%`}
                    >
                      <img src={scoreImage(row.aiScore)} alt={`${Math.round(row.aiScore)}%`} className="h-7 w-auto object-contain" />
                      <span className="text-[10px] text-slate-400">{Math.round(row.aiScore)}%</span>
                    </button>
                  ) : row.cvId && row.jobId && llmReady && onAiMatch ? (
                    <button
                      disabled={isMatching}
                      onClick={() => onAiMatch(row.cvId!, row.jobId!)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                      <AiIcon className="w-3 h-3 text-white flex-shrink-0" />
                      {isMatching ? aiMatchingLabel : aiMatchLabel}
                    </button>
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ─── GraphicalTab ─────────────────────────────────────────────────────────────

const GraphicalTab: React.FC<{
  activeCvs: CvItem[];
  activeJobs: JobItem[];
  localMatchMap: Map<string, Match>;
  atsMap: Map<string, AtsResult>;
  onPillClick: (atsResultId: number) => void;
  onLocalMatchClick: (cvId: string, jobId: string) => void;
  emptyLabel: string;
  colLowMatch: string;
  colHighMatch: string;
}> = ({ activeCvs, activeJobs, localMatchMap, atsMap, onPillClick, onLocalMatchClick, emptyLabel, colLowMatch, colHighMatch }) => {
  if (activeCvs.length === 0 || activeJobs.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-6">{emptyLabel}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left text-slate-500 font-normal pb-2 pr-4 w-48" />
            <th className="text-left text-slate-400 font-normal pb-2">
              <div className="flex justify-between">
                <img src={noWayImg} alt="" title={colLowMatch} className="h-6 w-auto object-contain" />
                <img src={excelentImg} alt="" title={colHighMatch} className="h-6 w-auto object-contain" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {activeJobs.map(job => (
            <tr key={job.id} className="border-t border-slate-100">
              <td className="py-3 pr-4 text-slate-700 font-medium align-top w-48 truncate max-w-[180px]">
                {job.displayName}
              </td>
              <td className="py-3 relative" style={{ height: 40 }}>
                <div className="relative w-full h-full flex items-center">
                  {activeCvs.map(cv => {
                    const localMatch = localMatchMap.get(`${cv.id}|${job.id}`);
                    const beMatch = atsMap.get(`${cv.name}|||${job.displayName}`);
                    const score = localMatch?.overall_score ?? beMatch?.overall_score ?? undefined;
                    const hasScore = score != null;
                    const position = hasScore ? (score / 100) : 0.5;
                    return (
                      <div
                        key={cv.id}
                        className="absolute"
                        style={{ left: `calc(${position * 100}% - 17px)`, opacity: hasScore ? 1 : 0.3 }}
                      >
                        <NamePill
                          id={cv.id}
                          title={cv.name}
                          initialsFrom={cv.candidateName}
                          size="sm"
                          onClick={
                            localMatch
                              ? () => onLocalMatchClick(cv.id, job.id)
                              : beMatch?.id
                              ? () => onPillClick(beMatch.id)
                              : undefined
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const JobsAndCvsPage: React.FC = () => {
  const { tSync } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { localRoles } = useLocalAccountContext();
  const llmReady = useLlmReady();

  const [cvs,  setCvs]  = useState<CvItem[]>([]);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [atsResults, setAtsResults] = useState<AtsResult[]>([]);
  const [localMatchMap, setLocalMatchMap] = useState<Map<string, Match>>(new Map());

  const [selectedCvIds,  setSelectedCvIds]  = useState<Set<string>>(new Set());
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());

  const [activeTab,    setActiveTab]    = useState<TabId>('cvs-jobs');
  const [filterCvOpen,  setFilterCvOpen]  = useState(false);
  const [filterJobOpen, setFilterJobOpen] = useState(false);
  const [detail,     setDetail]     = useState<AtsResultDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // AI match state
  const [matchingPairs,    setMatchingPairs]    = useState<Set<string>>(new Set());
  const [bulkProgress,     setBulkProgress]     = useState<{ done: number; total: number } | null>(null);
  const [bulkAtsProgress,  setBulkAtsProgress]  = useState<{ done: number; total: number } | null>(null);

  // Local match detail modal
  const [localDetail, setLocalDetail] = useState<{ cvId: string; jobId: string } | null>(null);

  // Load CVs from IDB — filter by role:
  // Kandidat only  → own candidate's CVs only
  // Säljare only   → managed candidates' CVs only (not own)
  // Both (or BE)   → all CVs
  useEffect(() => {
    (async () => {
      try {
        const isCandidate = user ? user.roles?.includes('User') : localRoles.includes('User');
        const isSeller    = user ? user.roles?.includes('Manager') : localRoles.includes('Manager');
        const allCvs = await LocalDbService.getAllCVs();
        const enriched = await Promise.all(
          allCvs.map(async cv => {
            let candidateName: string | undefined;
            let isOwn = false;
            try {
              const candidate = await LocalDbService.getCandidate(cv.candidate_id);
              candidateName = candidate?.name;
              isOwn = !!candidate?.is_own_candidate;
            } catch { /* skip */ }
            return { cv, candidateName, isOwn };
          })
        );
        const filtered = enriched.filter(({ isOwn }) => {
          if (isCandidate && isSeller) return true;   // both roles → all CVs
          if (isCandidate)             return isOwn;  // kandidat only → own CVs
          if (isSeller)                return !isOwn; // säljare only → managed CVs
          return true;                                // fallback (BE user without local roles) → all
        });
        const items: CvItem[] = filtered.map(({ cv, candidateName }) => ({
          id: cv.cv_id,
          name: cv.cv_title || cv.cv_anonymized.slice(0, 50),
          text: cv.cv_anonymized,
          candidateName,
        }));
        setCvs(items);
        setSelectedCvIds(new Set(items.map(c => c.id)));
      } catch { /* silently ignore */ }
    })();
  }, [user, localRoles]);

  // Load Jobs from IDB (client-first)
  useEffect(() => {
    (async () => {
      try {
        const allJobs = await LocalDbService.getAllJobs();
        const items: JobItem[] = allJobs.map(j => {
          let structured: StructuredJob | null = null;
          if (j.job_json) { try { structured = JSON.parse(j.job_json) as StructuredJob; } catch { /* skip */ } }
          return {
            id: j.job_id,
            displayName: j.job_title || j.job_description.slice(0, 50),
            channel: j.job_channel || undefined,
            text: j.job_description,
            company: structured?.job_company ?? undefined,
            applyLatest: structured?.job_apply_latest ?? undefined,
            domain: structured?.domain ?? undefined,
          };
        });
        setJobs(items);
        setSelectedJobIds(new Set(items.map(j => j.id)));
      } catch { /* silently ignore */ }
    })();
  }, []);

  // Load local match results from IDB
  useEffect(() => {
    LocalDbService.getAllMatches()
      .then(matches => {
        const m = new Map<string, Match>();
        matches.forEach(match => m.set(`${match.cv_id}|${match.job_id}`, match));
        setLocalMatchMap(m);
      })
      .catch(() => {});
  }, []);

  // Load BE ATS results (only when logged in)
  const refreshAtsResults = () => {
    if (!user) return;
    ApiService.getAtsResults().then(setAtsResults).catch(() => {});
  };

  useEffect(() => {
    refreshAtsResults();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshAtsResults();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const activeCvs  = useMemo(() => cvs.filter(c  => selectedCvIds.has(c.id)),   [cvs, selectedCvIds]);
  const activeJobs = useMemo(() => jobs.filter(j => selectedJobIds.has(j.id)), [jobs, selectedJobIds]);

  // BE ATS results keyed by cv_name|||job_title (for cross-reference when user is logged in)
  const atsMap = useMemo(() => {
    const m = new Map<string, AtsResult>();
    atsResults.forEach(r => {
      if (r.overall_score != null) {
        const jobTitle = parseJobName(r.job_name).title || r.job_name;
        m.set(`${r.cv_name}|||${jobTitle}`, r);
      }
    });
    return m;
  }, [atsResults]);

  const cvLabel = (cv: CvItem): string =>
    cv.candidateName ? `${cv.candidateName}, ${cv.name}` : cv.name;

  const jobLabel = (job: JobItem): string => {
    const parts: string[] = [job.displayName];
    if (job.company) parts.push(job.company);
    if (job.applyLatest) parts.push(new Date(job.applyLatest).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' }));
    return parts.join(', ');
  };

  const buildRow = (cv: CvItem, job: JobItem, primary: string, secondary: string): CompactRow => {
    const localMatch = localMatchMap.get(`${cv.id}|${job.id}`);
    const beMatch    = atsMap.get(`${cv.name}|||${job.displayName}`);
    return {
      primaryLine:  primary,
      secondaryLine: secondary,
      atsScore:    beMatch?.overall_score    ?? null,
      atsResultId: beMatch?.id,
      aiScore:     localMatch?.overall_score ?? null,
      cvId: cv.id,
      jobId: job.id,
    };
  };

  const tableRows = useMemo((): CompactRow[] => {
    if (activeTab === 'cvs-jobs') {
      return activeCvs.flatMap(cv =>
        activeJobs.map(job => buildRow(cv, job, cvLabel(cv), jobLabel(job)))
      );
    }
    if (activeTab === 'jobs-cvs') {
      return activeJobs.flatMap(job =>
        activeCvs.map(cv => buildRow(cv, job, jobLabel(job), cvLabel(cv)))
      );
    }
    if (activeTab === 'scores') {
      return activeCvs.flatMap(cv =>
        activeJobs.map(job => buildRow(cv, job, cvLabel(cv), jobLabel(job)))
      ).filter(r => r.atsScore != null || r.aiScore != null);
    }
    return [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCvs, activeJobs, localMatchMap, atsMap, activeTab]);

  const handleRowClick = async (atsResultId: number) => {
    setDetailOpen(true);
    try {
      const d = await ApiService.getAtsResult(atsResultId);
      setDetail(d as AtsResultDetail);
    } catch {
      setDetailOpen(false);
    }
  };

  const handleAiMatch = async (cvId: string, jobId: string) => {
    const cv = cvs.find(c => c.id === cvId);
    const job = jobs.find(j => j.id === jobId);
    if (!cv || !job || !cv.text || !job.text) return;

    const pairKey = `${cvId}|${jobId}`;
    setMatchingPairs(prev => new Set([...prev, pairKey]));

    try {
      // Structure CV — use cached cv_json if available
      let structuredCv: StructuredCV;
      const idbCv = await LocalDbService.getCV(cvId);
      if (idbCv?.cv_json) {
        structuredCv = JSON.parse(idbCv.cv_json) as StructuredCV;
      } else {
        structuredCv = await structureCV(cv.text);
        if (idbCv) await LocalDbService.updateCV(cvId, { cv_json: JSON.stringify(structuredCv) });
      }

      // Merge personal qualities into candidate
      if (idbCv?.candidate_id && structuredCv.personal_qualities?.length) {
        const candidate = await LocalDbService.getCandidate(idbCv.candidate_id);
        if (candidate) {
          const merged = [...new Set([...(candidate.personal_qualities ?? []), ...structuredCv.personal_qualities])];
          if (merged.length !== (candidate.personal_qualities ?? []).length) {
            await LocalDbService.updateCandidate(idbCv.candidate_id, { personal_qualities: merged, portrait: '' });
          }
        }
      }

      // Analyze job — use cached job_json if available
      const idbJob = await LocalDbService.getJob(jobId);
      let structuredJob: Awaited<ReturnType<typeof analyzeJob>>;
      if (idbJob?.job_json) {
        structuredJob = JSON.parse(idbJob.job_json) as Awaited<ReturnType<typeof analyzeJob>>;
      } else {
        structuredJob = await analyzeJob(job.displayName, job.text);
        if (idbJob) await LocalDbService.updateJob(jobId, { job_json: JSON.stringify(structuredJob) });
      }

      // Build experience strings from structured CV
      const experiences = structuredCv.work_experience.map(w => {
        const period = [w.start_date, w.end_date ?? 'nuvarande'].filter(Boolean).join('–');
        return `${w.position ?? '?'} hos ${w.company ?? '?'}${period ? ` (${period})` : ''}`;
      });

      // Build seeker profile from candidate
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

      const matchResult: MatchResult = await matchJobStructured(
        structuredCv.skills,
        experiences,
        structuredJob,
        seekerProfile,
      );

      // Persist to IDB
      const saved = await LocalDbService.setMatch(cvId, jobId, matchResult.overall_score, JSON.stringify(matchResult));

      // Update state
      setLocalMatchMap(prev => new Map(prev).set(pairKey, saved));
    } catch {
      // Silently ignore — the button will be available to retry
    } finally {
      setMatchingPairs(prev => { const n = new Set(prev); n.delete(pairKey); return n; });
    }
  };

  const handleLocalMatchClick = (cvId: string, jobId: string) => {
    setLocalDetail({ cvId, jobId });
  };

  const handleRematch = async () => {
    if (!localDetail) return;
    const { cvId, jobId } = localDetail;
    await handleAiMatch(cvId, jobId);
    // localMatchMap is updated inside handleAiMatch — modal re-renders automatically
  };

  const handleBulkAiMatch = async () => {
    const pairs = activeCvs.flatMap(cv =>
      activeJobs
        .filter(job => !localMatchMap.has(`${cv.id}|${job.id}`))
        .map(job => ({ cvId: cv.id, jobId: job.id }))
    );
    if (!pairs.length) return;
    setBulkProgress({ done: 0, total: pairs.length });
    for (let i = 0; i < pairs.length; i++) {
      await handleAiMatch(pairs[i].cvId, pairs[i].jobId);
      setBulkProgress({ done: i + 1, total: pairs.length });
    }
    setBulkProgress(null);
  };

  const handleBulkAtsMatch = async () => {
    const pairs = activeCvs.flatMap(cv =>
      activeJobs
        .filter(job => !atsMap.has(`${cv.name}|||${job.displayName}`))
        .map(job => ({ cv, job }))
    );
    if (!pairs.length) return;
    setBulkAtsProgress({ done: 0, total: pairs.length });
    for (let i = 0; i < pairs.length; i++) {
      const { cv, job } = pairs[i];
      try {
        await ApiService.runAtsScore(cv.text, job.text, cv.name, job.displayName);
      } catch { /* skip failed pair */ }
      setBulkAtsProgress({ done: i + 1, total: pairs.length });
    }
    setBulkAtsProgress(null);
    refreshAtsResults();
  };

  const handleDeleteCv = (id: string) => {
    const cv = cvs.find(c => c.id === id);
    if (cv) {
      LocalDbService.deleteCV(id).catch(() => {});
    }
    setCvs(prev => prev.filter(c => c.id !== id));
    setSelectedCvIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'cvs-jobs',  label: tSync('jac_tab_cvs_jobs') },
    { id: 'jobs-cvs',  label: tSync('jac_tab_jobs_cvs') },
    { id: 'scores',    label: tSync('jac_tab_scores') },
    { id: 'graphical', label: tSync('jac_tab_graphical') },
  ];

  return (
    <>
      <PageBackground imageUrl={coffeBreakImg} opacity={1} blur={0} className="!z-[2]" />
      <PageWrapper className="relative z-10">
        <PageCard
          title={tSync('jac_result')}
          action={
            <div className="flex gap-2">
              {(user ? user.roles?.includes('Manager') : localRoles.includes('Manager')) && (
                <Button variant="secondary" size="sm" onClick={() => navigate('/candidate_mgmt')}>{tSync('menu_manage_candidates')}</Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => navigate('/cv_mgmt')}>{tSync('jac_manage_cv')}</Button>
              <Button variant="secondary" size="sm" onClick={() => navigate('/job_mgmt')}>{tSync('jac_manage_job')}</Button>
            </div>
          }
        >
          {/* Tab bar */}
          <div className="flex gap-1 mb-4 border-b border-slate-200 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-sm font-medium whitespace-nowrap rounded-t-md transition-colors
                  ${activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setFilterCvOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <FunnelIcon />
              {tSync('jac_filter_cvs')} ({selectedCvIds.size}/{cvs.length})
              <span className="text-slate-400 text-xs">▾</span>
            </button>
            <button
              onClick={() => setFilterJobOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <FunnelIcon />
              {tSync('jac_filter_jobs')} ({selectedJobIds.size}/{jobs.length})
              <span className="text-slate-400 text-xs">▾</span>
            </button>
          </div>

          {/* Content */}
          {activeTab === 'graphical' ? (
            <GraphicalTab
              activeCvs={activeCvs}
              activeJobs={activeJobs}
              localMatchMap={localMatchMap}
              atsMap={atsMap}
              onPillClick={handleRowClick}
              onLocalMatchClick={handleLocalMatchClick}
              emptyLabel={tSync('jac_result_empty')}
              colLowMatch={tSync('jac_col_low_match')}
              colHighMatch={tSync('jac_col_high_match')}
            />
          ) : (
            <CompactTable
              rows={tableRows}
              emptyLabel={tSync('jac_result_empty')}
              sortByScore={activeTab === 'scores'}
              onRowClick={handleRowClick}
              onLocalMatchClick={handleLocalMatchClick}
              onAiMatch={handleAiMatch}
              matchingPairs={matchingPairs}
              llmReady={llmReady}
              showAts={!!user}
              aiMatchLabel={tSync('jac_ai_match_btn')}
              aiMatchingLabel={tSync('jac_ai_matching')}
            />
          )}

          {/* Bulk match buttons */}
          {activeCvs.length > 0 && activeJobs.length > 0 && (user || llmReady) && (
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-100">
              {/* ATS bulk — only when logged in to BE */}
              {user && (
                <button
                  onClick={handleBulkAtsMatch}
                  disabled={!!bulkAtsProgress || !!bulkProgress}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {bulkAtsProgress
                    ? tSync('jac_bulk_ats_matching')
                        .replace('{{done}}',  String(bulkAtsProgress.done))
                        .replace('{{total}}', String(bulkAtsProgress.total))
                    : tSync('jac_bulk_ats_match_btn')}
                </button>
              )}

              {/* AI bulk — only when LLM is configured */}
              {llmReady && (
                <button
                  onClick={handleBulkAiMatch}
                  disabled={!!bulkProgress || !!bulkAtsProgress}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <AiIcon className="w-4 h-4 text-white" />
                  {bulkProgress
                    ? tSync('jac_bulk_matching')
                        .replace('{{done}}',  String(bulkProgress.done))
                        .replace('{{total}}', String(bulkProgress.total))
                    : tSync('jac_bulk_match_btn')}
                </button>
              )}
            </div>
          )}
        </PageCard>
      </PageWrapper>

      <FilterModal
        open={filterCvOpen}
        onClose={() => setFilterCvOpen(false)}
        title={tSync('jac_filter_title_cvs')}
        items={cvs.map(c => ({ id: c.id, label: cvLabel(c) }))}
        selected={selectedCvIds}
        onChange={setSelectedCvIds}
        selectAllLabel={tSync('jac_select_all')}
        deselectAllLabel={tSync('jac_deselect_all')}
        onDeleteItem={handleDeleteCv}
      />
      <FilterModal
        open={filterJobOpen}
        onClose={() => setFilterJobOpen(false)}
        title={tSync('jac_filter_title_jobs')}
        items={jobs.map(j => ({ id: j.id, label: j.displayName }))}
        selected={selectedJobIds}
        onChange={setSelectedJobIds}
        selectAllLabel={tSync('jac_select_all')}
        deselectAllLabel={tSync('jac_deselect_all')}
      />
      {localDetail && (() => {
        const cv  = cvs.find(c => c.id === localDetail.cvId);
        const job = jobs.find(j => j.id === localDetail.jobId);
        const match = localMatchMap.get(`${localDetail.cvId}|${localDetail.jobId}`) ?? null;
        const pairKey = `${localDetail.cvId}|${localDetail.jobId}`;
        return (
          <LocalMatchDetailModal
            open={!!localDetail}
            onClose={() => setLocalDetail(null)}
            cvId={localDetail.cvId}
            jobId={localDetail.jobId}
            cvName={cv?.name ?? ''}
            jobName={job?.displayName ?? ''}
            candidateName={cv?.candidateName}
            jobCompany={job?.company}
            match={match}
            onRematch={handleRematch}
            rematching={matchingPairs.has(pairKey)}
          />
        );
      })()}

      <AtsResultDetailModal
        open={detailOpen}
        result={detail}
        onClose={() => { setDetailOpen(false); setDetail(null); }}
      />
    </>
  );
};

export default JobsAndCvsPage;
