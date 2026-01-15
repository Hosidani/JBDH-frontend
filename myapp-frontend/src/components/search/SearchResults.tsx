import React from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';

interface Job {
  jobId: number;
  title: string;
  company: string;
  location: string;
  description: string;
  postedDate?: string;
  webpageUrl?: string;
}

interface JobResult {
  job: Job;
  priority?: number;
  hasApplied?: boolean;
  latestAIResponse?: string | null;
  cvMatchPercent?: number | null;
}

interface SearchResultsProps {
  results: JobResult[] | null;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
  const { tSync } = useTranslation();

  if (!results) return null;

  return (
    <div className="card relative z-10 p-6 mt-6">
      <h3 className="text-xl font-bold mb-4">{tSync('searchJobs_results_title')}</h3>

      {results.length === 0 ? (
        <div className="text-center py-8 text-gray-500">{tSync('searchJobs_no_results')}</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="px-4 py-3 text-left font-semibold text-sm">{tSync('searchResults_job_title')}</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">{tSync('searchResults_added_by')}</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">{tSync('searchResults_deadline')}</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">{tSync('searchResults_area')}</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">{tSync('searchResults_compensation')}</th>
                <th className="px-4 py-3 text-center font-semibold text-sm">{tSync('searchResults_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => {
                const job = result.job;
                return (
                  <tr key={job.jobId} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-sm">{job.title}</div>
                      <div className="text-xs text-gray-600">{job.description.length > 100 ? job.description.slice(0, 100) + '...' : job.description}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{job.company || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {job.postedDate ? new Date(job.postedDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{job.location || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">-</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          title={tSync('searchResults_save_tooltip')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          🔖
                        </button>
                        <button
                          title={tSync('searchResults_delete_tooltip')}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded transition"
                        >
                          🗑️
                        </button>
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
