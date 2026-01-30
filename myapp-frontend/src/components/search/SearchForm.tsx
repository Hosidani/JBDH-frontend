import React, { useState } from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';

interface SearchFormProps {
  onSubmit: (formData: SearchFormData) => void;
  loading: boolean;
}

export interface SearchFormData {
  location: string;
  workArea: string;
  jobDescription: string;
  roles: string;
  competence: string;
  useProfile: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSubmit, loading }) => {
  const { tSync } = useTranslation();
  const [location, setLocation] = useState('');
  const [workArea, setWorkArea] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [roles, setRoles] = useState('');
  const [competencies, setCompetencies] = useState('');
  const [useProfile, setUseProfile] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      location,
      workArea,
      jobDescription,
      roles,
      competence: competencies, // ändrat till singular för backend
      useProfile,
    });
  };

  return (
    <div className="card relative z-10 p-6">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#2563eb' }}>
        {tSync('searchJobs_title')}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location/Area */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="location" className="font-semibold">
                {tSync('searchForm_location_label')}
              </label>
              <span className="text-gray-400 text-sm cursor-help" title={tSync('searchForm_location_help')}>
                ℹ️
              </span>
            </div>
            <input
              id="location"
              type="text"
              placeholder={tSync('searchForm_location_placeholder')}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border border-slate-200 rounded-md px-3 py-2"
            />
          </div>

          {/* Work Area */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="workArea" className="font-semibold">
                {tSync('searchForm_work_area_label')}
              </label>
              <span className="text-gray-400 text-sm cursor-help" title={tSync('searchForm_work_area_help')}>
                ℹ️
              </span>
            </div>
            <input
              id="workArea"
              type="text"
              placeholder={tSync('searchForm_work_area_placeholder')}
              value={workArea}
              onChange={(e) => setWorkArea(e.target.value)}
              className="w-full border border-slate-200 rounded-md px-3 py-2"
            />
          </div>

          {/* Roles */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="roles" className="font-semibold">
                {tSync('searchForm_roles_label')}
              </label>
              <span className="text-gray-400 text-sm cursor-help" title={tSync('searchForm_roles_help')}>
                ℹ️
              </span>
            </div>
            <input
              id="roles"
              type="text"
              placeholder={tSync('searchForm_roles_placeholder')}
              value={roles}
              onChange={(e) => setRoles(e.target.value)}
              className="w-full border border-slate-200 rounded-md px-3 py-2"
            />
          </div>

          {/* Competencies */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="competencies" className="font-semibold">
                {tSync('searchForm_competencies_label')}
              </label>
              <span className="text-gray-400 text-sm cursor-help" title={tSync('searchForm_competencies_help')}>
                ℹ️
              </span>
            </div>
            <input
              id="competencies"
              type="text"
              placeholder={tSync('searchForm_competencies_placeholder')}
              value={competencies}
              onChange={(e) => setCompetencies(e.target.value)}
              className="w-full border border-slate-200 rounded-md px-3 py-2"
            />
          </div>
        </div>

        {/* Job Description - Full Width */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label htmlFor="jobDescription" className="font-semibold">
              {tSync('searchForm_job_description_label')}
            </label>
            <span className="text-gray-400 text-sm cursor-help" title={tSync('searchForm_job_description_help')}>
              ℹ️
            </span>
          </div>
          <textarea
            id="jobDescription"
            placeholder={tSync('searchForm_job_description_placeholder')}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={3}
            className="w-full border border-slate-200 rounded-md px-3 py-2"
          />
        </div>

        {/* Use Profile Toggle */}
        <div className="flex items-center gap-3">
          <label htmlFor="useProfile" className="flex items-center gap-2 cursor-pointer">
            <input
              id="useProfile"
              type="checkbox"
              checked={useProfile}
              onChange={(e) => setUseProfile(e.target.checked)}
              className="w-5 h-5 rounded"
            />
            <span className="font-semibold">{tSync('searchForm_use_profile_label')}</span>
          </label>
          <span className="text-gray-400 text-sm cursor-help" title={tSync('searchForm_use_profile_help')}>
            ℹ️
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? tSync('searchForm_searching') : tSync('searchForm_search_button')}
        </button>
      </form>
    </div>
  );
};

export default SearchForm;
