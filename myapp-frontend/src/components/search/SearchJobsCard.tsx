import React, { useState, useEffect } from 'react';
import type { SearchFormData } from './SearchForm';
import { SearchForm, SearchResults } from './index';
import { ApiService, type JobDetailsDto } from '../../services/ApiService';

const STORAGE_KEY = 'searchState';

const SearchJobsCard: React.FC = () => {
  const [results, setResults] = useState<JobDetailsDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialFormValues, setInitialFormValues] = useState<SearchFormData | undefined>(undefined);

  useEffect(() => {
    if (sessionStorage.getItem('searchReturnFlag') === '1') {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { formData, results: savedResults } = JSON.parse(saved);
        setInitialFormValues(formData);
        setResults(savedResults);
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
    } catch (err) {
      setError('An error occurred during the search.');
    } finally {
      setLoading(false);
    }
  };

  const handleJobUpdate = (updatedJob: JobDetailsDto) => {
    if (results) {
      const updatedResults = results.map(job => 
        job.jobId === updatedJob.jobId ? updatedJob : job
      );
      setResults(updatedResults);
    }
  };

  const handleJobRemove = (jobId: number) => {
    if (results) {
      const filteredResults = results.filter(job => job.jobId !== jobId);
      setResults(filteredResults);
    }
  };

  return (
    <div className="w-full">
      <SearchForm onSubmit={handleSearch} loading={loading} initialValues={initialFormValues} />
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}
      <SearchResults 
        results={results} 
        onJobUpdate={handleJobUpdate} 
        onJobRemove={handleJobRemove}
      />
    </div>
  );
};

export default SearchJobsCard;
