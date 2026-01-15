import React from 'react';
import { useTranslation } from '../../../hooks/TranslationProvider';
import SavedJobCard from './SavedJobCard';
import type { SavedJob } from './SavedJobCard';

interface SavedJobsListProps {
  jobs: SavedJob[];
  loading?: boolean;
  onSave?: (id: number) => void;
  onDelete?: (id: number) => void;
  onClick?: (id: number) => void;
}

const SavedJobsList: React.FC<SavedJobsListProps> = ({
  jobs,
  loading = false,
  onSave,
  onDelete,
  onClick,
}) => {
  const { tSync } = useTranslation();

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{tSync('savedJobsList_loading')}</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{tSync('savedJobsList_empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <SavedJobCard
          key={job.id}
          job={job}
          onSave={onSave}
          onDelete={onDelete}
          onClick={onClick}
        />
      ))}
    </div>
  );
};

export default SavedJobsList;
