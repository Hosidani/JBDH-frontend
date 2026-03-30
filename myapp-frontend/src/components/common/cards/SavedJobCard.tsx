import React from 'react';
import { useTranslation } from '../../../hooks/TranslationProvider';
import { Icon } from '../../ui/Icon';

export interface SavedJob {
  id: number;
  title: string;
  company: string;
  location: string;
  workType?: string;
  employmentType?: string;
  lastApplicationDate: string;
  isActionItem?: boolean;
  saved?: boolean;
  notes?: string;
}

interface SavedJobCardProps {
  job: SavedJob;
  onSave?: (id: number) => void;
  onDelete?: (id: number) => void;
  onClick?: (id: number) => void;
  onNotes?: (id: number) => void;
}

const SavedJobCard: React.FC<SavedJobCardProps> = ({
  job,
  onSave,
  onDelete,
  onClick,
  onNotes,
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
      {/* Header with title */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {job.company} | {job.location}
            {job.workType && ` | ${job.workType}`}
          </p>
        </div>
      </div>

      {/* Last application date */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <p className="text-xs text-gray-500">{tSync('savedJobCard_last_application_date')}</p>
          <p className="text-sm font-semibold text-gray-900">{job.lastApplicationDate}</p>
        </div>
      </div>

      {/* Notes section */}
      {job.notes && (
        <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-200 rounded">
          <p className="text-xs text-yellow-700 font-semibold mb-1">{tSync('savedJobCard_notes')}</p>
          <p className="text-sm text-yellow-800">{job.notes}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 justify-end mt-4">
        <button
          onClick={() => onNotes?.(job.id)}
          title={tSync('savedJobCard_notes_tooltip')}
          className={`p-2 rounded transition ${
            job.notes
              ? 'bg-yellow-100 text-yellow-600'
              : 'text-gray-400 hover:bg-gray-100'
          }`}
        >
          <Icon name="edit_note" size={24} />
        </button>
        <button
          onClick={() => onSave?.(job.id)}
          title={tSync('savedJobCard_save_tooltip')}
          className={`p-2 rounded transition ${
            job.saved
              ? 'text-gray-400 hover:bg-gray-100'
              : 'text-gray-400 hover:bg-gray-100'
          }`}
        >
          <Icon name="bookmark" filled={!!job.saved} size={24} />
        </button>
        <button
          onClick={() => onDelete?.(job.id)}
          title={tSync('savedJobCard_delete_tooltip')}
          className="p-2 text-gray-400 hover:bg-gray-100 rounded transition"
        >
          <Icon name="delete" size={24} />
        </button>
      </div>
    </div>
  );
};

export default SavedJobCard;
