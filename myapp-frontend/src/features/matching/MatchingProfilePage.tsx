import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/TranslationProvider';
import { PageWrapper, PageBackground } from '../../components/common';
import { MatchingAssignmentsList } from '../../components/common/cards';
import type { MatchingAssignment } from '../../components/common/cards';

const MatchingProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { tSync } = useTranslation();
  const [assignments, setAssignments] = useState<MatchingAssignment[]>([
    {
      id: 1,
      title: 'Fullstackutvecklare',
      company: 'High Tech AB',
      location: 'Stockholm | Heltid',
      postedDate: '2025-12-23',
      matchPercentage: 92,
      isActionItem: false,
      saved: false,
    },
    {
      id: 2,
      title: 'Tech Lead',
      company: 'Futuristica',
      location: 'Göteborg | Heltid',
      postedDate: '2025-11-19',
      matchPercentage: 87,
      isActionItem: false,
      saved: false,
    },
    {
      id: 3,
      title: 'Frontendutvecklare i Angular',
      company: 'Wyswwigg AB',
      location: 'Göteborg | Heltid',
      postedDate: '2025-11-19',
      matchPercentage: 95,
      isActionItem: true,
      saved: false,
    },
    {
      id: 4,
      title: 'Job title / Role',
      company: 'HighTechComp',
      location: 'BiggerCity | Heltid',
      postedDate: '2025-12-23',
      matchPercentage: 78,
      isActionItem: false,
      saved: true,
    },
    {
      id: 5,
      title: 'Job title / Role',
      company: 'HighTechComp',
      location: 'BiggerCity | Fulltid',
      postedDate: '2025-11-19',
      matchPercentage: 65,
      isActionItem: false,
      saved: false,
    },
  ]);

  const handleSave = (id: number) => {
    setAssignments(assignments.map(a => 
      a.id === id ? { ...a, saved: !a.saved } : a
    ));
  };

  const handleDelete = (id: number) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };

  const handleCardClick = (id: number) => {
    navigate(`/job/${id}`);
  };

  return (
    <>
      <PageBackground imageUrl="/match_profile.png" opacity={1} blur={0} />
      <PageWrapper>
        <div className="card relative z-10 p-6">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#2563eb' }}>
            {tSync('matchingProfilePage_title')}
          </h2>
          <p className="text-gray-600 mb-8">
            {tSync('matchingProfilePage_subtitle')}
          </p>

          <MatchingAssignmentsList
            assignments={assignments}
            onSave={handleSave}
            onDelete={handleDelete}
            onClick={handleCardClick}
          />
        </div>
      </PageWrapper>
    </>
  );
};

export default MatchingProfilePage;
