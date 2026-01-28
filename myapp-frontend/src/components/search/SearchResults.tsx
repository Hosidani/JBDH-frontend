import React, { useState } from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';
import { ApiService, type JobDetailsDto } from '../../services/ApiService';

interface SearchResultsProps {
  results: JobDetailsDto[] | null;
  onJobUpdate?: (updatedJob: JobDetailsDto) => void;
  onJobRemove?: (jobId: number) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, onJobUpdate, onJobRemove }) => {
  const { tSync } = useTranslation();
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});

  if (!results) return null;

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
    setLoadingStates(prev => ({ ...prev, [jobId]: true }));
    
    try {
      // 1. Call backend API first
      await ApiService.markNotInterested(jobId);
      
      // 2. Remove from UI immediately for instant feedback
      if (onJobRemove) {
        onJobRemove(jobId);
      }
      
      // Note: Next search will automatically exclude this job from backend
    } catch (error) {
      console.error('Failed to mark job as not interested:', error);
      // On error, job stays visible - user can try again
    } finally {
      setLoadingStates(prev => ({ ...prev, [jobId]: false }));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE');
  };

  return (
    <div className="card relative z-10 p-8 mt-6 max-w-6xl mx-auto">
      <h3 className="text-xl font-bold mb-4">{tSync('searchJobs_results_title')}</h3>

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
                      <div className="font-semibold text-sm">{job.title || 'Unknown Title'}</div>
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
                            disabled={isLoading}
                            title={tSync('searchResults_hide_tooltip')}
                            className={`p-1 text-gray-600 hover:bg-gray-100 rounded transition text-sm ${
                              isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {isLoading ? '⏳' : '🗑️'}
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
