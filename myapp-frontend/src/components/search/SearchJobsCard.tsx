import React, { useState } from 'react';
import type { SearchFormData } from './SearchForm';
import { SearchForm, SearchResults } from './index';
import { ApiService, type JobDetailsDto } from '../../services/ApiService';

const SearchJobsCard: React.FC = () => {
  const [results, setResults] = useState<JobDetailsDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (formData: SearchFormData) => {
    setError(null);
    setLoading(true);
    setResults(null);

    try {
      // Use ApiService to search jobs (currently returns hardcoded data)
      const searchResults = await ApiService.searchJobs(formData);
      setResults(searchResults);
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
      <SearchForm onSubmit={handleSearch} loading={loading} />
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
