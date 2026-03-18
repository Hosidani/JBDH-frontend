import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/TranslationProvider';
import { ApiService, type JobDetailsDto } from '../../services/ApiService';

interface SearchResultsProps {
  results: JobDetailsDto[] | null;
  onJobUpdate?: (updatedJob: JobDetailsDto) => void;
  onJobRemove?: (jobId: number) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, onJobUpdate, onJobRemove }) => {
  const { tSync } = useTranslation();
  const navigate = useNavigate();
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const [countdownStates, setCountdownStates] = useState<Record<number, number>>({});
  const [timers, setTimers] = useState<Record<number, NodeJS.Timeout>>({});

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timers).forEach(timer => {
        if (timer) clearInterval(timer);
      });
    };
  }, [timers]);

  if (!results) return null;

  const handleJobClick = (jobId: number) => {
    navigate(`/job/${jobId}`);
  };

  const handleSaveToggle = async (job: JobDetailsDto) => {
    const jobId = job.jobId;
    setLoadingStates(prev => ({ ...prev, [jobId]: true }));
    
    try {
      if (job.isSaved) {
        await ApiService.unsaveJob(jobId);
      } else {
        await ApiService.saveJob(jobId);
      }
      
      // Update the job state
      const updatedJob = { ...job, isSaved: !job.isSaved };
      if (onJobUpdate) {
        onJobUpdate(updatedJob);
      }
    } catch (error) {
      console.error('Failed to toggle save state:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [jobId]: false }));
    }
  };

  const handleMarkNotInterested = async (jobId: number) => {
    // If already in countdown, cancel the action
    if (countdownStates[jobId] > 0) {
      // Cancel countdown
      setCountdownStates(prev => ({ ...prev, [jobId]: 0 }));
      setLoadingStates(prev => ({ ...prev, [jobId]: false }));
      
      // Clear timer
      if (timers[jobId]) {
        clearInterval(timers[jobId]);
        setTimers(prev => {
          const newTimers = { ...prev };
          delete newTimers[jobId];
          return newTimers;
        });
      }
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, [jobId]: true }));
    setCountdownStates(prev => ({ ...prev, [jobId]: 5 }));
    
    // Start countdown timer - API call happens ONLY when countdown reaches 0
    const timer = setInterval(() => {
      setCountdownStates(prev => {
        const currentCount = prev[jobId] || 0;
        if (currentCount <= 1) {
          clearInterval(timer);
          setTimers(prevTimers => {
            const newTimers = { ...prevTimers };
            delete newTimers[jobId];
            return newTimers;
          });
          
          // NOW call the API and remove from UI
          ApiService.markNotInterested(jobId)
            .then(() => {
              if (onJobRemove) {
                onJobRemove(jobId);
              }
            })
            .catch((err) => {
              console.error('Failed to mark job as not interested:', err);
              // Remove from UI even if API call fails
              if (onJobRemove) {
                onJobRemove(jobId);
              }
            })
            .finally(() => {
              setLoadingStates(prevLoading => ({ ...prevLoading, [jobId]: false }));
              setCountdownStates(prevCountdown => ({ ...prevCountdown, [jobId]: 0 }));
            });
          
          return { ...prev, [jobId]: 0 };
        }
        return { ...prev, [jobId]: currentCount - 1 };
      });
    }, 1000);
    
    // Store timer reference
    setTimers(prev => ({ ...prev, [jobId]: timer }));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE');
  };

  return (
    <div className="card relative z-10 p-8 mt-6 max-w-6xl mx-auto">
      <h3 className="text-xl font-bold mb-4">{tSync('searchJobs_results_title')} ({results.length})</h3>

      {results.length === 0 ? (
        <div className="text-center py-8 text-gray-500">{tSync('searchJobs_no_results')}</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse table-auto">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="px-3 py-3 text-left font-semibold text-sm w-1/2">{tSync('searchResults_job_title')}</th>
                <th className="px-2 py-3 text-left font-semibold text-sm w-20">{tSync('searchResults_added_by')}</th>
                <th className="px-2 py-3 text-left font-semibold text-sm w-24">{tSync('searchResults_deadline')}</th>
                <th className="px-2 py-3 text-left font-semibold text-sm w-20">{tSync('searchResults_area')}</th>
                <th className="px-2 py-3 text-left font-semibold text-sm w-20">{tSync('searchResults_compensation')}</th>
                <th className="px-2 py-3 text-center font-semibold text-sm w-28">{tSync('searchResults_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {results.map((job) => {
                const isLoading = loadingStates[job.jobId] || false;
                return (
                  <tr key={job.jobId} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-3 py-3 w-1/2">
                      <div 
                        className="font-semibold text-sm text-blue-600 hover:text-blue-800 cursor-pointer hover:underline transition"
                        onClick={() => handleJobClick(job.jobId)}
                        title="Click to view job details"
                      >
                        {job.title || 'Unknown Title'}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {job.description && job.description.length > 80 
                          ? job.description.slice(0, 80) + '...' 
                          : job.description || 'No Description'}
                      </div>
                    </td>
                    <td className="px-2 py-3 text-sm text-gray-700 w-20">Platsbanken</td>
                    <td className="px-2 py-3 text-sm text-gray-600 w-24">
                      {formatDate(job.applicationDeadline)}
                    </td>
                    <td className="px-2 py-3 text-sm text-gray-700 w-20">{job.location || 'Unknown Location'}</td>
                    <td className="px-2 py-3 text-sm text-gray-700 w-20">-</td>
                    <td className="px-2 py-3 w-28">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => handleSaveToggle(job)}
                          disabled={isLoading}
                          title={job.isSaved ? tSync('searchResults_unsave_tooltip') : tSync('searchResults_save_tooltip')}
                          className={`p-1 rounded transition text-sm ${
                            job.isSaved 
                              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                              : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isLoading ? '⏳' : (job.isSaved ? '🖤' : '🤍')}
                        </button>
                        {!job.isSaved && (
                          <button
                            onClick={() => handleMarkNotInterested(job.jobId)}
                            disabled={false}
                            title={countdownStates[job.jobId] > 0 ? tSync('jobDetail_cancel_action') : tSync('searchResults_hide_tooltip')}
                            className={`p-1 rounded transition text-sm cursor-pointer ${
                              countdownStates[job.jobId] > 0
                                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {countdownStates[job.jobId] > 0 
                              ? `🗑️ ${countdownStates[job.jobId]}` 
                              : (isLoading ? '⏳' : '🗑️')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
