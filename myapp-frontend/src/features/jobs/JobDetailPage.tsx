import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper, PageBackground } from '../../components/common';
import JobDetailCard from '../../components/common/cards/JobDetailCard';
import type { SavedJob } from '../../components/common/cards';

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'description' | 'matching'>('description');

  // Mock job data - in a real app, fetch based on ID
  const job: SavedJob & { competencies?: string[]; matchPercentage?: number; description?: string; matchingAnalysis?: string } = {
    id: parseInt(id || '1'),
    title: 'Fullstackutvecklare',
    company: 'High Tech AB',
    location: 'Stockholm',
    workType: 'Deltid',
    lastApplicationDate: '2025-12-23',
    isActionItem: false,
    saved: true,
    competencies: ['React Native', 'Javascript', 'PHP', 'CSS', 'Typescript', 'UX', 'HTTP', 'AI Prompting', 'UI'],
    matchPercentage: 89,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    matchingAnalysis: 'Your CV matches this position very well. You have most of the required technical skills and relevant experience. Consider developing skills in: Advanced DevOps, Kubernetes, and AWS.',
  };

  const handleApply = () => {
    // TODO: Implement apply functionality
    console.log('Apply clicked for job:', job.id);
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Save clicked for job:', job.id);
  };

  const handleNotInterested = () => {
    // TODO: Implement not interested functionality
    navigate(-1);
  };

  return (
    <>
      <PageBackground imageUrl="/job_detail.png" opacity={1} blur={0} />
      <PageWrapper>
        <div className="card relative z-10 p-6">
          <JobDetailCard 
            job={job}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onApply={handleApply}
            onSave={handleSave}
            onNotInterested={handleNotInterested}
          />
        </div>
      </PageWrapper>
    </>
  );
};

export default JobDetailPage;
