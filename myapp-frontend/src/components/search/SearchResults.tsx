import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/TranslationProvider';
import { ApiService, type JobDetailsDto } from '../../services/ApiService';
import { DataList, type DataListColumn } from '../ui/DataList';
import { Icon } from '../ui/Icon';

interface SearchResultsProps {
  results: JobDetailsDto[] | null;
  onJobUpdate?: (updatedJob: JobDetailsDto) => void;
  onJobRemove?: (jobId: number) => void;
}

const STORAGE_KEY = 'searchResultsList';

const SearchResults: React.FC<SearchResultsProps> = ({ results, onJobUpdate, onJobRemove }) => {
  const { tSync } = useTranslation();
  const navigate = useNavigate();
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const [countdownStates, setCountdownStates] = useState<Record<number, number>>({});
  const [timers, setTimers] = useState<Record<number, NodeJS.Timeout>>({});
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);

  useEffect(() => {
    return () => { Object.values(timers).forEach(t => clearInterval(t)); };
  }, [timers]);

  if (!results) return null;

  const handleJobClick = (job: JobDetailsDto) => {
    setSelectedId(job.jobId);
    sessionStorage.setItem('searchReturnFlag', '1');
    sessionStorage.setItem(STORAGE_KEY + '_selected', String(job.jobId));
    navigate(`/job/${job.jobId}`);
  };

  const handleSaveToggle = async (e: React.MouseEvent, job: JobDetailsDto) => {
    e.stopPropagation();
    const jobId = job.jobId;
    setLoadingStates(prev => ({ ...prev, [jobId]: true }));
    try {
      if (job.isSaved) {
        await ApiService.unsaveJob(jobId);
      } else {
        await ApiService.saveJob(jobId);
      }
      onJobUpdate?.({ ...job, isSaved: !job.isSaved });
    } catch {
      // ignore
    } finally {
      setLoadingStates(prev => ({ ...prev, [jobId]: false }));
    }
  };

  const handleMarkNotInterested = (e: React.MouseEvent, jobId: number) => {
    e.stopPropagation();
    if (countdownStates[jobId] > 0) {
      clearInterval(timers[jobId]);
      setCountdownStates(prev => ({ ...prev, [jobId]: 0 }));
      setLoadingStates(prev => ({ ...prev, [jobId]: false }));
      setTimers(prev => { const n = { ...prev }; delete n[jobId]; return n; });
      return;
    }
    setLoadingStates(prev => ({ ...prev, [jobId]: true }));
    setCountdownStates(prev => ({ ...prev, [jobId]: 5 }));
    const timer = setInterval(() => {
      setCountdownStates(prev => {
        const current = prev[jobId] || 0;
        if (current <= 1) {
          clearInterval(timer);
          setTimers(p => { const n = { ...p }; delete n[jobId]; return n; });
          ApiService.markNotInterested(jobId)
            .finally(() => {
              onJobRemove?.(jobId);
              setLoadingStates(p => ({ ...p, [jobId]: false }));
              setCountdownStates(p => ({ ...p, [jobId]: 0 }));
            });
          return { ...prev, [jobId]: 0 };
        }
        return { ...prev, [jobId]: current - 1 };
      });
    }, 1000);
    setTimers(prev => ({ ...prev, [jobId]: timer }));
  };

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('sv-SE') : '-';

  const columns: DataListColumn<JobDetailsDto>[] = [
    {
      key: 'title',
      label: tSync('searchResults_job_title'),
      render: job => (
        <div>
          <div className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">
            {job.title || '-'}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {job.description && job.description.length > 80
              ? job.description.slice(0, 80) + '…'
              : job.description || ''}
          </div>
        </div>
      ),
    },
    {
      key: 'source',
      label: tSync('searchResults_added_by'),
      width: '100px',
      render: () => <span className="text-slate-600">Platsbanken</span>,
    },
    {
      key: 'deadline',
      label: tSync('searchResults_deadline'),
      width: '100px',
      render: job => <span className="text-slate-600">{formatDate(job.applicationDeadline)}</span>,
    },
    {
      key: 'location',
      label: tSync('searchResults_area'),
      width: '120px',
      render: job => <span className="text-slate-600">{job.location || '-'}</span>,
    },
    {
      key: 'compensation',
      label: tSync('searchResults_compensation'),
      width: '80px',
      render: () => <span className="text-slate-400">-</span>,
    },
    {
      key: '_actions',
      label: tSync('searchResults_actions'),
      width: '80px',
      align: 'center',
      render: job => {
        const isLoading = loadingStates[job.jobId] || false;
        const countdown = countdownStates[job.jobId] || 0;
        return (
          <div className="flex gap-1 justify-center">
            <button
              onClick={e => handleSaveToggle(e, job)}
              disabled={isLoading}
              title={job.isSaved ? tSync('searchResults_unsave_tooltip') : tSync('searchResults_save_tooltip')}
              className={`p-1 rounded text-sm transition
                ${job.isSaved ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'}
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading
                ? <Icon name="sync" size={24} className="animate-spin" />
                : <Icon name="bookmark" filled={job.isSaved} size={24} />}
            </button>
            {!job.isSaved && (
              <button
                onClick={e => handleMarkNotInterested(e, job.jobId)}
                title={countdown > 0 ? tSync('jobDetail_cancel_action') : tSync('searchResults_hide_tooltip')}
                className={`p-1 rounded text-sm transition cursor-pointer
                  ${countdown > 0 ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                {countdown > 0
                  ? <><Icon name="delete" size={24} /><span className="text-xs font-mono">{countdown}</span></>
                  : isLoading
                    ? <Icon name="sync" size={24} className="animate-spin" />
                    : <Icon name="delete" size={24} />}
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <DataList
        items={results}
        columns={columns}
        getItemId={job => job.jobId}
        onItemClick={handleJobClick}
        selectedId={selectedId}
        pageSize={20}
        storageKey={STORAGE_KEY}
        emptyMessage={tSync('searchJobs_no_results')}
        maxHeight="60vh"
      />
    </div>
  );
};

export default SearchResults;
