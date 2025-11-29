const API_URL = import.meta.env.VITE_API_URL;
import React, { useState } from 'react';

interface JobResult {
  // Adjust fields as needed based on your backend response
  jobId: number;
  title: string;
  company: string;
  location: string;
  description: string;
}

const SearchJobsPage: React.FC = () => {
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
      const response = await fetch(`${API_URL}/Search/SearchForJobs?${params.toString()}`, {
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
    <div className="relative min-h-screen bg-transparent">
      {/* Background image overlay */}
      <div
        aria-hidden="true"
        className="fixed left-0 right-0 bottom-0 z-0 bg-cover bg-center w-full"
        style={{
          top: '100px', // match header height
          height: 'calc(100vh - 100px)',
          position: 'fixed',
          backgroundImage: 'url(/searchJobsPage.png)',
          opacity: 0.18,
          filter: 'blur(1px)',
          objectFit: 'cover',
        }}
      />
      <div className="relative z-10 max-w-xl w-full mx-auto mt-8 card">
        <h2 style={{ color: '#2563eb', textAlign: 'center' }}>Search for Jobs</h2>
        <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="input-dark" style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Location</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="input-dark" style={{ width: '100%' }} />
          </div>
          {error && <div style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', background: '#2563eb', color: 'white', padding: 10, borderRadius: 4, fontWeight: 600 }}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
        {results && (
          <div>
            <h3>Results</h3>
            {results.length === 0 ? (
              <div>No jobs found.</div>
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
    </div>
  );
};

export default SearchJobsPage;
