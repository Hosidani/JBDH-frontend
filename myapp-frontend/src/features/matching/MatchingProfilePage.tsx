import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/TranslationProvider';
import { PageWrapper, PageBackground } from '../../components/common';
import { MatchingAssignmentsList, MatchingAnalysisTab } from '../../components/common/cards';
import { getMatchingJobs } from '../../services/mockData';
import type { MatchingAssignment } from '../../components/common/cards';

const MatchingProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { tSync } = useTranslation();
  const [activeTab, setActiveTab] = useState<'description' | 'matching'>('description');
  
  const mockJobData = getMatchingJobs();
  const [assignments, setAssignments] = useState<MatchingAssignment[]>(
    mockJobData.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: `${job.location} | ${job.workType}`,
      postedDate: job.postedDate || '',
      matchPercentage: job.matchPercentage,
      isActionItem: job.isActionItem,
      saved: job.saved,
    }))
  );

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

          {/* Tabs */}
          <div className="flex gap-6 mb-8 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-3 font-medium transition-colors ${
                activeTab === 'description'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Beskrivning
            </button>
            <button
              onClick={() => setActiveTab('matching')}
              className={`pb-3 font-medium transition-colors ${
                activeTab === 'matching'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Matchning
            </button>
          </div>

          {/* Tab content */}
          {activeTab === 'description' && (
            <MatchingAssignmentsList
              assignments={assignments}
              onSave={handleSave}
              onDelete={handleDelete}
              onClick={handleCardClick}
            />
          )}

          {activeTab === 'matching' && (
            <MatchingAnalysisTab
              matches={[
                { id: 1, label: 'utfasdfsfdf' },
                { id: 2, label: 'utfasdfsfdf' },
                { id: 3, label: 'utfasdfsfdf' },
                { id: 4, label: 'utfasdfsfdf' },
                { id: 5, label: 'utfasdfsfdf' },
                { id: 6, label: 'utfasdfsfdf' },
              ]}
              nonMatches={[
                { id: 1, label: 'utfasdfsfdf' },
                { id: 2, label: 'utfasdfsfdf' },
                { id: 3, label: 'utfasdfsfdf' },
              ]}
              improvements={[
                { id: 1, label: 'utfasdfsfdf' },
                { id: 2, label: 'utfasdfsfdf' },
                { id: 3, label: 'utfasdfsfdf' },
              ]}
              coachTips="Molkt instruit quis ultanso duis de tempos non exumot nonisul nuns. Nula ex ventum nili culba. Dus alscusing bro diance mim amet danz co ord mitui unse. Dus molkt molkt molkt molkt molkt molkt molkt molkt molkt."
            />
          )}
        </div>
      </PageWrapper>
    </>
  );
};

export default MatchingProfilePage;
