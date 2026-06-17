import React from 'react';
import { useTranslation } from '../../../hooks/TranslationProvider';

export interface MatchingAssignment {
  id: number;
  title: string;
  company: string;
  location: string;
  salary?: string;
  postedDate: string;
  matchPercentage?: number;
  isActionItem?: boolean;
  saved?: boolean;
}

interface MatchingAssignmentCardProps {
  assignment: MatchingAssignment;
  onSave?: (id: number) => void;
  onDelete?: (id: number) => void;
  onClick?: (id: number) => void;
}

const MatchingAssignmentCard: React.FC<MatchingAssignmentCardProps> = ({ 
  assignment, 
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
    onClick?.(assignment.id);
  };

  return (
    <div 
      className="border border-gray-300 rounded-lg p-6 bg-white hover:shadow-md transition cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Header with title and action item badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{assignment.title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {assignment.company} | {assignment.location}
            {assignment.salary && ` | ${assignment.salary}`}
          </p>
        </div>
        {assignment.isActionItem && (
          <span className="ml-4 px-3 py-1 bg-purple-600 text-white text-sm font-semibold rounded-sm whitespace-nowrap">
            {tSync('matchingAssignmentCard_action_item')}
          </span>
        )}
      </div>

      {/* Posted date and match percentage */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <div>
          <p className="text-xs text-gray-500">{tSync('matchingAssignmentCard_posted_date')}</p>
          <p className="text-sm font-semibold text-gray-900">{assignment.postedDate}</p>
        </div>
        {assignment.matchPercentage !== undefined && (
          <div className="flex flex-col items-end">
            <p className="text-xs text-gray-500">{tSync('matchingAssignmentCard_match_score')}</p>
            <p className="text-lg font-bold text-blue-600">{assignment.matchPercentage}%</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => onSave?.(assignment.id)}
          title={tSync('matchingAssignmentCard_save_tooltip')}
          className={`p-2 rounded transition ${
            assignment.saved
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-400 hover:bg-gray-100'
          }`}
        >
          🔖
        </button>
        <button
          onClick={() => onDelete?.(assignment.id)}
          title={tSync('matchingAssignmentCard_delete_tooltip')}
          className="p-2 text-gray-400 hover:bg-gray-100 rounded transition"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default MatchingAssignmentCard;
