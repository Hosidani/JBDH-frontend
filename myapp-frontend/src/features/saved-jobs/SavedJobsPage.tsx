import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/TranslationProvider';
import { PageWrapper, PageBackground } from '../../components/common';
import { SavedJobsList } from '../../components/common/cards';
import { getSavedJobs } from '../../services/mockData';
import type { SavedJob } from '../../components/common/cards';

const SavedJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const { tSync } = useTranslation();
  
  const mockJobData = getSavedJobs();
  const [jobs, setJobs] = useState<SavedJob[]>(
    mockJobData.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      workType: job.workType,
      lastApplicationDate: job.lastApplicationDate || '',
      isActionItem: job.isActionItem,
      saved: job.saved,
    }))
  );

  const handleSave = (id: number) => {
    setJobs(jobs.map(j => 
      j.id === id ? { ...j, saved: !j.saved } : j
    ));
  };

  const handleDelete = (id: number) => {
    setJobs(jobs.filter(j => j.id !== id));
  };

  const handleCardClick = (id: number) => {
    navigate(`/job/${id}`);
  };

  return (
    <>
      <PageBackground imageUrl="/saved_jobs.png" opacity={1} blur={0} />
      <PageWrapper>
        <div className="card relative z-10 p-6">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#2563eb' }}>
            {tSync('savedJobsPage_title')}
          </h2>
          <p className="text-gray-600 mb-8">
            {tSync('savedJobsPage_description')}
          </p>

          <SavedJobsList
            jobs={jobs}
            onSave={handleSave}
            onDelete={handleDelete}
            onClick={handleCardClick}
          />
        </div>
      </PageWrapper>
    </>
  );
};

export default SavedJobsPage;
