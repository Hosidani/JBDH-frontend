import React, { useEffect, useMemo, useState } from 'react';
import { PageBackground, PageWrapper, Modal } from '../../components/common';
import { PageCard } from '../../components/common/PageCard';
import { Button } from '../../components/ui/Button';
import { NamePill } from '../../components/common/NamePill';
import { ApiService } from '../../services/ApiService';
import { useTranslation } from '../../hooks/TranslationProvider';
import { parseJobName } from '../../utils/parseJobName';
import AddCvModal from './AddCvModal';
import AddJobModal from './AddJobModal';
import AtsResultDetailModal, { type AtsResultDetail } from '../ats/AtsResultDetailModal';
import coffeBreakImg from '../../assets/img/Coffe-break.png';
import noWayImg from '../../assets/graphics/NoWay.png';
import poorImg from '../../assets/graphics/Poor.png';
import notLikelyImg from '../../assets/graphics/NotLikely.png';
import fairImg from '../../assets/graphics/Fair.png';
import excelentImg from '../../assets/graphics/Excelent.png';

// ─── types ────────────────────────────────────────────────────────────────────

interface CvItem  { id: number; name: string; text: string }
interface JobItem { id: number; displayName: string; rawName: string; channel?: string; text: string }
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
  score: number | null;
  atsResultId?: number;
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
  items: { id: number; label: string }[];
  selected: Set<number>;
  onChange: (next: Set<number>) => void;
  selectAllLabel: string;
  deselectAllLabel: string;
}

const FilterModal: React.FC<FilterModalProps> = ({
  open, onClose, title, items, selected, onChange, selectAllLabel, deselectAllLabel,
}) => {
  const toggle = (id: number) => {
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
          <li key={item.id}>
            <label className="flex items-center gap-2 cursor-pointer py-1.5 px-2 hover:bg-slate-50 rounded-md text-sm text-slate-700">
              <input
                type="checkbox"
                checked={selected.has(item.id)}
                onChange={() => toggle(item.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {item.label}
            </label>
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
}> = ({ rows, emptyLabel, sortByScore = false, onRowClick }) => {
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(sortByScore ? 'desc' : 'asc');

  useEffect(() => { setSortDir(sortByScore ? 'desc' : 'asc'); }, [sortByScore]);

  const sorted = useMemo(() => [...rows].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortByScore) {
      const sa = a.score ?? -Infinity;
      const sb = b.score ?? -Infinity;
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
            {!sortByScore && (
              <th className="text-right text-slate-500 font-semibold pb-2 w-16">Score</th>
            )}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const clickable = !!row.atsResultId && !!onRowClick;
            return (
              <tr
                key={i}
                className={`border-t border-slate-100 hover:bg-blue-50 ${clickable ? 'cursor-pointer' : ''}`}
                onClick={clickable ? () => onRowClick!(row.atsResultId!) : undefined}
              >
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    {sortByScore && row.score != null && (
                      <img
                        src={scoreImage(row.score)}
                        alt={`${Math.round(row.score)}%`}
                        title={`${Math.round(row.score)}%`}
                        className="h-7 w-auto object-contain flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-slate-700 font-medium leading-tight truncate">{row.primaryLine}</p>
                      <p className="text-slate-400 text-xs leading-tight truncate">{row.secondaryLine}</p>
                    </div>
                  </div>
                </td>
                {!sortByScore && (
                  <td className="py-2 text-right">
                    {row.score != null
                      ? <img src={scoreImage(row.score)} alt={`${Math.round(row.score)}%`} title={`${Math.round(row.score)}%`} className="h-7 w-auto object-contain inline-block" />
                      : <span className="text-slate-400">—</span>}
                  </td>
                )}
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
  atsMap: Map<string, AtsResult>;
  onPillClick: (atsResultId: number) => void;
  emptyLabel: string;
  colLowMatch: string;
  colHighMatch: string;
}> = ({ activeCvs, activeJobs, atsMap, onPillClick, emptyLabel, colLowMatch, colHighMatch }) => {
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
                    const match = atsMap.get(`${cv.name}|||${job.displayName}`);
                    const hasScore = match != null;
                    const position = hasScore ? (match.overall_score! / 100) : 0.5;
                    return (
                      <div
                        key={cv.id}
                        className="absolute"
                        style={{ left: `calc(${position * 100}% - 17px)`, opacity: hasScore ? 1 : 0.3 }}
                      >
                        <NamePill
                          id={cv.id}
                          title={cv.name}
                          size="sm"
                          onClick={hasScore ? () => onPillClick(match.id) : undefined}
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

  const [cvs,  setCvs]  = useState<CvItem[]>([]);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [atsResults, setAtsResults] = useState<AtsResult[]>([]);

  const [selectedCvIds,  setSelectedCvIds]  = useState<Set<number>>(new Set());
  const [selectedJobIds, setSelectedJobIds] = useState<Set<number>>(new Set());

  const [activeTab,    setActiveTab]    = useState<TabId>('cvs-jobs');
  const [filterCvOpen,  setFilterCvOpen]  = useState(false);
  const [filterJobOpen, setFilterJobOpen] = useState(false);
  const [cvModalOpen,   setCvModalOpen]   = useState(false);
  const [jobModalOpen,  setJobModalOpen]  = useState(false);
  const [detail,     setDetail]     = useState<AtsResultDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const refreshAtsResults = () => {
    ApiService.getAtsResults().then(setAtsResults).catch(() => {});
  };

  useEffect(() => {
    ApiService.getExternalCVs().then(data => {
      const items: CvItem[] = data.map(c => ({ id: c.id, name: c.name || c.text.slice(0, 50), text: c.text }));
      setCvs(items);
      setSelectedCvIds(new Set(items.map(c => c.id)));
    }).catch(() => {});

    ApiService.getExternalJobAds().then(data => {
      const items: JobItem[] = data.map(j => {
        const parsed = parseJobName(j.name || '');
        return {
          id: j.id,
          displayName: parsed.title || j.text.slice(0, 50),
          rawName: j.name || '',
          channel: parsed.channel || undefined,
          text: j.text,
        };
      });
      setJobs(items);
      setSelectedJobIds(new Set(items.map(j => j.id)));
    }).catch(() => {});

    refreshAtsResults();
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshAtsResults();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const activeCvs  = useMemo(() => cvs.filter(c  => selectedCvIds.has(c.id)),   [cvs, selectedCvIds]);
  const activeJobs = useMemo(() => jobs.filter(j => selectedJobIds.has(j.id)), [jobs, selectedJobIds]);

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

  const tableRows = useMemo((): CompactRow[] => {
    if (activeTab === 'cvs-jobs') {
      return activeCvs.flatMap(cv =>
        activeJobs.map(job => {
          const match = atsMap.get(`${cv.name}|||${job.displayName}`);
          return { primaryLine: cv.name, secondaryLine: job.displayName, score: match?.overall_score ?? null, atsResultId: match?.id };
        })
      );
    }
    if (activeTab === 'jobs-cvs') {
      return activeJobs.flatMap(job =>
        activeCvs.map(cv => {
          const match = atsMap.get(`${cv.name}|||${job.displayName}`);
          return { primaryLine: job.displayName, secondaryLine: cv.name, score: match?.overall_score ?? null, atsResultId: match?.id };
        })
      );
    }
    if (activeTab === 'scores') {
      return activeCvs.flatMap(cv =>
        activeJobs.map(job => {
          const match = atsMap.get(`${cv.name}|||${job.displayName}`);
          return { primaryLine: cv.name, secondaryLine: job.displayName, score: match?.overall_score ?? null, atsResultId: match?.id };
        })
      ).filter(r => r.score != null);
    }
    return [];
  }, [activeCvs, activeJobs, atsMap, activeTab]);

  const handleRowClick = async (atsResultId: number) => {
    setDetailOpen(true);
    try {
      const d = await ApiService.getAtsResult(atsResultId);
      setDetail(d as AtsResultDetail);
    } catch {
      setDetailOpen(false);
    }
  };

  const channelSuggestions = useMemo(
    () => [...new Set(jobs.map(j => j.channel).filter(Boolean) as string[])],
    [jobs],
  );

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
              <Button variant="secondary" size="sm" onClick={() => setCvModalOpen(true)}>{tSync('jac_add_cv')}</Button>
              <Button variant="secondary" size="sm" onClick={() => setJobModalOpen(true)}>{tSync('jac_add_job')}</Button>
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
              atsMap={atsMap}
              onPillClick={handleRowClick}
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
            />
          )}
        </PageCard>
      </PageWrapper>

      <FilterModal
        open={filterCvOpen}
        onClose={() => setFilterCvOpen(false)}
        title={tSync('jac_filter_title_cvs')}
        items={cvs.map(c => ({ id: c.id, label: c.name }))}
        selected={selectedCvIds}
        onChange={setSelectedCvIds}
        selectAllLabel={tSync('jac_select_all')}
        deselectAllLabel={tSync('jac_deselect_all')}
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
      <AddCvModal
        open={cvModalOpen}
        onClose={() => setCvModalOpen(false)}
        onAdded={item => {
          const name = item.name || item.text.slice(0, 50);
          setCvs(prev => [{ id: item.id, name, text: item.text }, ...prev]);
          setSelectedCvIds(prev => new Set([...prev, item.id]));
          refreshAtsResults();
        }}
      />
      <AddJobModal
        open={jobModalOpen}
        onClose={() => setJobModalOpen(false)}
        onAdded={item => {
          const parsed = parseJobName(item.name || '');
          const job: JobItem = {
            id: item.id,
            displayName: parsed.title || item.text.slice(0, 50),
            rawName: item.name || '',
            channel: parsed.channel || undefined,
            text: item.text,
          };
          setJobs(prev => [job, ...prev]);
          setSelectedJobIds(prev => new Set([...prev, item.id]));
          refreshAtsResults();
        }}
        channelSuggestions={channelSuggestions}
      />
      <AtsResultDetailModal
        open={detailOpen}
        result={detail}
        onClose={() => { setDetailOpen(false); setDetail(null); }}
      />
    </>
  );
};

export default JobsAndCvsPage;
