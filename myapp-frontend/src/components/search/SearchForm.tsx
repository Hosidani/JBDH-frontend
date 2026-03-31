import React, { useState } from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';
import { TextInput } from '../ui/TextInput';
import { FormField } from '../common/FormField';
import { Button } from '../ui/Button';

export interface SearchFormData {
  location: string;
  workArea: string;
  jobDescription: string;
  roles: string;
  competence: string;
  useProfile: boolean;
}

interface SearchFormProps {
  onSubmit: (formData: SearchFormData) => void;
  loading: boolean;
  initialValues?: SearchFormData;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSubmit, loading, initialValues }) => {
  const { tSync } = useTranslation();
  const [location, setLocation] = useState(initialValues?.location ?? '');
  const [workArea, setWorkArea] = useState(initialValues?.workArea ?? '');
  const [jobDescription, setJobDescription] = useState(initialValues?.jobDescription ?? '');
  const [roles, setRoles] = useState(initialValues?.roles ?? '');
  const [competencies, setCompetencies] = useState(initialValues?.competence ?? '');
  const [useProfile, setUseProfile] = useState(initialValues?.useProfile ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ location, workArea, jobDescription, roles, competence: competencies, useProfile });
  };

  return (
    <div className="card relative z-10 p-6">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#2563eb' }}>
        {tSync('searchJobs_title')}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextInput
            label={tSync('searchForm_location_label')}
            helpText={tSync('searchForm_location_help')}
            placeholder={tSync('searchForm_location_placeholder')}
            value={location}
            onChange={setLocation}
          />
          <TextInput
            label={tSync('searchForm_work_area_label')}
            helpText={tSync('searchForm_work_area_help')}
            placeholder={tSync('searchForm_work_area_placeholder')}
            value={workArea}
            onChange={setWorkArea}
          />
          <TextInput
            label={tSync('searchForm_roles_label')}
            helpText={tSync('searchForm_roles_help')}
            placeholder={tSync('searchForm_roles_placeholder')}
            value={roles}
            onChange={setRoles}
          />
          <TextInput
            label={tSync('searchForm_competencies_label')}
            helpText={tSync('searchForm_competencies_help')}
            placeholder={tSync('searchForm_competencies_placeholder')}
            value={competencies}
            onChange={setCompetencies}
          />
        </div>

        {/* Job Description — full width, textarea */}
        <FormField
          label={tSync('searchForm_job_description_label')}
          helpText={tSync('searchForm_job_description_help')}
        >
          <textarea
            placeholder={tSync('searchForm_job_description_placeholder')}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </FormField>

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
        </div>

        {/* Submit Button */}
        <Button type="submit" variant="primary" size="lg" disabled={loading} className="self-start">
          {loading ? tSync('searchForm_searching') : tSync('searchForm_search_button')}
        </Button>
      </form>
    </div>
  );
};

export default SearchForm;
