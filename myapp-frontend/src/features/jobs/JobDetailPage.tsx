import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper, PageBackground } from '../../components/common';
import JobDetailCard from '../../components/common/cards/JobDetailCard';
import { getJobById } from '../../services/mockData';
import type { SavedJob } from '../../components/common/cards';

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'description' | 'matching'>('description');

  // Fetch job from mock data by ID
  const mockJob = getJobById(parseInt(id || '1'));
  
  const job: SavedJob & { competencies?: string[]; matchPercentage?: number; description?: string; matchingAnalysis?: string } = mockJob ? {
    id: mockJob.id,
    title: mockJob.title,
    company: mockJob.company,
    location: mockJob.location,
    workType: mockJob.workType,
    lastApplicationDate: mockJob.lastApplicationDate || '',
    isActionItem: mockJob.isActionItem,
    saved: mockJob.saved,
    competencies: mockJob.competencies,
    matchPercentage: mockJob.matchPercentage,
    description: mockJob.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    matchingAnalysis: 'Your CV matches this position very well. You have most of the required technical skills and relevant experience.',
  } : {
    id: 0,
    title: 'Job Not Found',
    company: 'Unknown',
    location: 'Unknown',
    workType: 'Unknown',
    lastApplicationDate: '',
    isActionItem: false,
    saved: false,
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
