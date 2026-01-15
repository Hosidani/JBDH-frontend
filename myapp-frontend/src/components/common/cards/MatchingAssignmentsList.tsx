import React from 'react';
import { useTranslation } from '../../../hooks/TranslationProvider';
import MatchingAssignmentCard from './MatchingAssignmentCard';
import type { MatchingAssignment } from './MatchingAssignmentCard';

interface MatchingAssignmentsListProps {
  assignments: MatchingAssignment[];
  loading?: boolean;
  onSave?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const MatchingAssignmentsList: React.FC<MatchingAssignmentsListProps> = ({
  assignments,
  loading = false,
  onSave,
  onDelete,
}) => {
  const { tSync } = useTranslation();

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{tSync('matchingAssignmentsList_loading')}</p>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{tSync('matchingAssignmentsList_empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <MatchingAssignmentCard
          key={assignment.id}
          assignment={assignment}
          onSave={onSave}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default MatchingAssignmentsList;
