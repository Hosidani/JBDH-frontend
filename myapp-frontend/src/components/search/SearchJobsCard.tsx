import React, { useState, useEffect } from 'react';
import type { SearchFormData } from './SearchForm';
import { SearchForm, SearchResults } from './index';
import { ApiService, type JobDetailsDto } from '../../services/ApiService';
import { Tabs } from '../ui/Tabs';
import { useTranslation } from '../../hooks/TranslationProvider';

const STORAGE_KEY = 'searchState';

const SearchJobsCard: React.FC = () => {
  const { tSync } = useTranslation();
  const [results, setResults] = useState<JobDetailsDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialFormValues, setInitialFormValues] = useState<SearchFormData | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('search');

  useEffect(() => {
    if (sessionStorage.getItem('searchReturnFlag') === '1') {
      sessionStorage.removeItem('searchReturnFlag');
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { formData, results: savedResults } = JSON.parse(saved);
        setInitialFormValues(formData);
        setResults(savedResults);
        setActiveTab('results');
      }
    }
  }, []);

  const handleSearch = async (formData: SearchFormData) => {
    setError(null);
    setLoading(true);
    setResults(null);
    try {
      const searchResults = await ApiService.searchJobs(formData);
      setResults(searchResults);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ formData, results: searchResults }));
      setActiveTab('results');
    } catch {
      setError('An error occurred during the search.');
    } finally {
      setLoading(false);
    }
  };

  const handleJobUpdate = (updatedJob: JobDetailsDto) => {
    if (results) setResults(results.map(j => j.jobId === updatedJob.jobId ? updatedJob : j));
  };

  const handleJobRemove = (jobId: number) => {
    if (results) setResults(results.filter(j => j.jobId !== jobId));
  };

  const tabs = [
    {
      key: 'search',
      label: tSync('searchJobs_tab_search'),
      content: (
        <>
          <SearchForm onSubmit={handleSearch} loading={loading} initialValues={initialFormValues} />
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}
        </>
      ),
    },
    {
      key: 'results',
      label: (
        <span>
          {tSync('searchJobs_tab_results')}
          {results !== null && (
            <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {results.length}
            </span>
          )}
        </span>
      ),
      disabled: results === null,
      content: (
        <SearchResults
          results={results}
          onJobUpdate={handleJobUpdate}
          onJobRemove={handleJobRemove}
        />
      ),
    },
  ];

  return (
    <div className="card relative z-10 p-6">
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default SearchJobsCard;
