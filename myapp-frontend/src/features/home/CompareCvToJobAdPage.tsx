const API_URL = import.meta.env.VITE_API_URL;
import React, { useState } from 'react';

const CompareCvToJobAdPage: React.FC = () => {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobAdText, setJobAdText] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCvFile(e.target.files[0]);
    } else {
      setCvFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const formData = new FormData();
      if (cvFile) formData.append('CvPath', cvFile);
      formData.append('JobAdText', jobAdText);
  const response = await fetch(`${API_URL}/api/Home/CompareCvToJobAd`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await response.json();
      if (response.ok && data.aiResponse) {
        setResult(data.aiResponse);
      } else {
        setError(data.error || 'Något gick fel vid jämförelsen.');
      }
    } catch (err) {
      setError('Ett fel uppstod vid jämförelsen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 card">
      <h2 className="text-2xl font-bold mb-4">Matcha CV mot jobbannons</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block mb-1 font-semibold">CV-fil</label>
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} required />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Jobbannons (text)</label>
          <textarea
            value={jobAdText}
            onChange={e => setJobAdText(e.target.value)}
            rows={6}
            className="input-dark w-full border border-slate-200 rounded-md px-3 py-2"
            required
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
        >
          {loading ? 'Jämför...' : 'Jämför CV mot annons'}
        </button>
      </form>
      {result && (
        <div className="mt-6 p-4 bg-slate-100 rounded">
          <h3 className="font-bold mb-2">AI-analys:</h3>
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}
    </div>
  );
};

export default CompareCvToJobAdPage;
