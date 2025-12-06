import React, { useState } from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';

interface JobResult {
  jobId: number;
  title: string;
  company: string;
  location: string;
  description: string;
}

interface SearchJobsCardProps {
  apiUrl: string;
}

const SearchJobsCard: React.FC<SearchJobsCardProps> = ({ apiUrl }) => {
    const { tSync } = useTranslation();
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState<JobResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResults(null);
    try {
      const params = new URLSearchParams();
      if (description) params.append('description', description);
      if (location) params.append('location', location);
      const response = await fetch(`${apiUrl}/Search/SearchForJobs?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        setError('Search failed.');
        setLoading(false);
        return;
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card relative z-10">
      <h2 style={{ color: '#2563eb', textAlign: 'center' }}>{tSync('searchJobs_title')}</h2>
      <div style={{ marginBottom: '1rem', color: '#374151', fontSize: '1rem' }}>
        {tSync('searchJobs_instructions')}
      </div>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="description">{tSync('searchJobs_description_label')}</label>
          <input id="description" type="text" value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%' }} />
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{tSync('searchJobs_description_help')}</div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="location">{tSync('searchJobs_location_label')}</label>
          <input id="location" type="text" value={location} onChange={e => setLocation(e.target.value)} style={{ width: '100%' }} />
          <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{tSync('searchJobs_location_help')}</div>
        </div>
        {error && <div style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', background: '#2563eb', color: 'white', padding: 10, borderRadius: 4, fontWeight: 600 }}>
          {loading ? tSync('searchJobs_searching') : tSync('searchJobs_search_button')}
        </button>
      </form>
      {results && (
        <div>
          <h3>{tSync('searchJobs_results_title')}</h3>
          {results.length === 0 ? (
            <div>{tSync('searchJobs_no_results')}</div>
          ) : (
            <ul style={{ padding: 0, listStyle: 'none' }}>
              {results.map(job => (
                <li key={job.jobId} style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
                  <div style={{ fontWeight: 600 }}>{job.title}</div>
                  <div>{job.company} - {job.location}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>{job.description}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchJobsCard;
