import React, { useState } from 'react';
import type { SearchFormData } from './SearchForm';
import { SearchForm, SearchResults } from './index';

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

interface SearchJobsCardProps {
  apiUrl: string;
}

const SearchJobsCard: React.FC<SearchJobsCardProps> = ({ apiUrl }) => {
  const [results, setResults] = useState<JobResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (formData: SearchFormData) => {
    setError(null);
    setLoading(true);
    setResults(null);

    try {
      const params = new URLSearchParams();
      if (formData.location) params.append('location', formData.location);
      if (formData.workArea) params.append('workArea', formData.workArea);
      if (formData.jobDescription) params.append('description', formData.jobDescription);
      if (formData.roles) params.append('roles', formData.roles);
      if (formData.competencies) params.append('competencies', formData.competencies);
      if (formData.useProfile) params.append('useProfile', 'true');

      const response = await fetch(`${apiUrl}/Search/SearchForJobs?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        setError('Search failed.');
        return;
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('An error occurred during the search.');
    } finally {
      setLoading(false);
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
      <SearchResults results={results} />
    </div>
  );
};

export default SearchJobsCard;
