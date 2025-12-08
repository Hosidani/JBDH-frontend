import React, { useState } from 'react';
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
    <div className="card relative z-10" style={{ margin: '0 auto', width: '100%' }}>
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
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <table className="bg-white border border-gray-200 rounded" style={{ width: '100%' }}>
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-3 py-2 text-left" style={{ whiteSpace: 'nowrap' }}>Jobb/Uppdrag</th>
                    <th className="px-3 py-2 text-left" style={{ whiteSpace: 'nowrap' }}>Kort beskrivning</th>
                    <th className="px-3 py-2 text-left" style={{ whiteSpace: 'nowrap' }}>Publicerad</th>
                    <th className="px-3 py-2 text-left" style={{ whiteSpace: 'nowrap' }}>Deadline</th>
                    <th className="px-3 py-2 text-left" style={{ whiteSpace: 'nowrap' }}>Område</th>
                    <th className="px-3 py-2 text-left" style={{ whiteSpace: 'nowrap' }}>Lön</th>
                    <th className="px-3 py-2 text-left" style={{ whiteSpace: 'nowrap' }}>Åtgärder</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(result => {
                    const job = result.job;
                    return (
                      <tr key={job.jobId} className="border-b">
                        <td className="px-3 py-2 font-semibold" style={{ wordBreak: 'break-word' }}>{job.title}</td>
                        <td className="px-3 py-2 text-gray-700" style={{ wordBreak: 'break-word' }}>{job.description.length > 100 ? job.description.slice(0, 100) + "..." : job.description}</td>
                        <td className="px-3 py-2 text-gray-500">{job.postedDate ? new Date(job.postedDate).toLocaleDateString() : '-'}</td>
                        <td className="px-3 py-2 text-gray-500">-</td>
                        <td className="px-3 py-2">{job.location || '-'}</td>
                        <td className="px-3 py-2">-</td>
                        <td className="px-3 py-2">
                          <button title="Spara" className="mr-2 px-2 py-1 bg-blue-100 rounded hover:bg-blue-200">💾</button>
                          <button title="Dölj" className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">🚫</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchJobsCard;
