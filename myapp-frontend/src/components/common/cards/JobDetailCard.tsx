import React, { Fragment } from 'react';

const renderDescription = (text: string) =>
  text.split(/\n{2,}/).map((paragraph, pi) => (
    <p key={pi} className="text-gray-700 leading-relaxed mb-3">
      {paragraph.split('\n').map((line, li, arr) => (
        <Fragment key={li}>
          {line}
          {li < arr.length - 1 && <br />}
        </Fragment>
      ))}
    </p>
  ));
import { useTranslation } from '../../../hooks/TranslationProvider';
import type { SavedJob } from './SavedJobCard';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/Icon';

interface JobDetailCardProps {
  job: SavedJob & {
    competencies?: string[];
    matchPercentage?: number;
    description?: string;
    matchingAnalysis?: string;
  };
  onApply: () => void;
  onSave: () => void;
  onNotInterested: () => void;
  isLoading?: boolean;
  isNotInterestedLoading?: boolean;
  countdown?: number;
}

const JobDetailCard: React.FC<JobDetailCardProps> = ({
  job,
  onApply,
  onSave,
  onNotInterested,
  isLoading = false,
  isNotInterestedLoading = false,
  countdown = 0,
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
            <p className="font-semibold text-gray-900">{job.employmentType}</p>
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
          <Button variant="primary" size="lg" onClick={onApply}>
            {tSync('jobDetail_apply_button')}
          </Button>
          <Button variant="secondary" size="lg" disabled={isLoading} onClick={onSave}>
            <Icon name="bookmark" filled={!!job.saved} size={24} className="mr-1" />
            {tSync('jobDetail_save_button')}
          </Button>
          <Button variant="secondary" size="lg" onClick={onNotInterested}>
            <Icon name="delete" size={24} className="mr-1" />
            {isNotInterestedLoading && countdown > 0
              ? tSync('jobDetail_job_disappearing').replace('{seconds}', countdown.toString())
              : tSync('jobDetail_not_interested_button')}
          </Button>
        </div>
      </div>

      {/* Description */}
      <div className="p-6">
        {job.description ? renderDescription(job.description) : null}
      </div>
    </div>
  );
};

export default JobDetailCard;
