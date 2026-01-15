import React from 'react';
import { useTranslation } from '../../../hooks/TranslationProvider';
import MatchingAnalysisTab from './MatchingAnalysisTab';
import type { SavedJob } from './SavedJobCard';

interface JobDetailCardProps {
  job: SavedJob & {
    competencies?: string[];
    matchPercentage?: number;
    description?: string;
    matchingAnalysis?: string;
  };
  activeTab: 'description' | 'matching';
  onTabChange: (tab: 'description' | 'matching') => void;
  onApply: () => void;
  onSave: () => void;
  onNotInterested: () => void;
}

const JobDetailCard: React.FC<JobDetailCardProps> = ({
  job,
  activeTab,
  onTabChange,
  onApply,
  onSave,
  onNotInterested,
}) => {
  const { tSync } = useTranslation();

  return (
    <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
        
        {/* Job Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">{tSync('jobDetail_last_application_date')}</p>
            <p className="font-semibold text-gray-900">{job.lastApplicationDate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">{tSync('jobDetail_company')}</p>
            <p className="font-semibold text-gray-900">{job.company}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">{tSync('jobDetail_work_arrangement')}</p>
            <p className="font-semibold text-gray-900">{job.workType}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">{tSync('jobDetail_employment_type')}</p>
            <p className="font-semibold text-gray-900">{tSync('jobDetail_employment_hybrid')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">{tSync('jobDetail_location')}</p>
            <p className="font-semibold text-gray-900">{job.location}</p>
          </div>
        </div>

        {/* Competencies */}
        {job.competencies && job.competencies.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-2">{tSync('jobDetail_competencies')}</p>
            <div className="flex flex-wrap gap-2">
              {job.competencies.map((competency) => (
                <span
                  key={competency}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium"
                >
                  {competency}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Match Percentage */}
        {job.matchPercentage !== undefined && (
          <div className="flex items-center gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">{tSync('jobDetail_match_score')}</p>
              <p className="text-2xl font-bold text-blue-600">{job.matchPercentage}%</p>
            </div>
            <div className="w-24 h-24 bg-gradient-to-b from-green-400 to-blue-500 rounded flex items-center justify-center text-white font-bold text-lg">
              {job.matchPercentage}%
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onApply}
            className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition font-semibold"
          >
            {tSync('jobDetail_apply_button')}
          </button>
          <button
            onClick={onSave}
            title={tSync('jobDetail_save_tooltip')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
          >
            🔖 {tSync('jobDetail_save_button')}
          </button>
          <button
            onClick={onNotInterested}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
          >
            🗑️ {tSync('jobDetail_not_interested_button')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex">
        <button
          onClick={() => onTabChange('description')}
          className={`flex-1 px-6 py-4 font-semibold transition ${
            activeTab === 'description'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {tSync('jobDetail_tab_description')}
        </button>
        <button
          onClick={() => onTabChange('matching')}
          className={`flex-1 px-6 py-4 font-semibold transition ${
            activeTab === 'matching'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {tSync('jobDetail_tab_matching')}
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'description' && (
          <div>
            <p className="text-gray-700 leading-relaxed">{job.description}</p>
          </div>
        )}
        {activeTab === 'matching' && (
          <MatchingAnalysisTab
            matches={[
              { id: 1, label: 'React' },
              { id: 2, label: 'TypeScript' },
              { id: 3, label: 'Angular' },
              { id: 4, label: 'CSS' },
              { id: 5, label: 'Material Design' },
              { id: 6, label: 'Responsive Design' },
            ]}
            nonMatches={[
              { id: 1, label: 'Python' },
              { id: 2, label: 'DevOps' },
              { id: 3, label: 'Machine Learning' },
            ]}
            improvements={[
              { id: 1, label: 'Advanced State Management' },
              { id: 2, label: 'E2E Testing' },
              { id: 3, label: 'Performance Optimization' },
            ]}
            coachTips="Your CV matches this position very well. You have most of the required technical skills and relevant experience. Consider developing skills in: Advanced DevOps, Kubernetes, and AWS."
          />
        )}
      </div>
    </div>
  );
};

export default JobDetailCard;
