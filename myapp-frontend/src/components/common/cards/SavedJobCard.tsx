import React from 'react';
import { useTranslation } from '../../../hooks/TranslationProvider';

export interface SavedJob {
  id: number;
  title: string;
  company: string;
  location: string;
  workType?: string;
  lastApplicationDate: string;
  isActionItem?: boolean;
  saved?: boolean;
}

interface SavedJobCardProps {
  job: SavedJob;
  onSave?: (id: number) => void;
  onDelete?: (id: number) => void;
  onClick?: (id: number) => void;
}

const SavedJobCard: React.FC<SavedJobCardProps> = ({ 
  job, 
  onSave, 
  onDelete,
  onClick 
}) => {
  const { tSync } = useTranslation();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick?.(job.id);
  };

  return (
    <div 
      className="border border-gray-300 rounded-lg p-6 bg-white hover:shadow-md transition cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Header with title and action item badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {job.company} | {job.location}
            {job.workType && ` | ${job.workType}`}
          </p>
        </div>
        {job.isActionItem && (
          <span className="ml-4 px-3 py-1 bg-purple-600 text-white text-sm font-semibold rounded-full whitespace-nowrap">
            {tSync('savedJobCard_action_item')}
          </span>
        )}
      </div>

      {/* Last application date */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <p className="text-xs text-gray-500">{tSync('savedJobCard_last_application_date')}</p>
          <p className="text-sm font-semibold text-gray-900">{job.lastApplicationDate}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-end mt-4">
        <button
          onClick={() => onSave?.(job.id)}
          title={tSync('savedJobCard_save_tooltip')}
          className={`p-2 rounded transition ${
            job.saved
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-400 hover:bg-gray-100'
          }`}
        >
          🔖
        </button>
        <button
          onClick={() => onDelete?.(job.id)}
          title={tSync('savedJobCard_delete_tooltip')}
          className="p-2 text-gray-400 hover:bg-gray-100 rounded transition"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default SavedJobCard;
