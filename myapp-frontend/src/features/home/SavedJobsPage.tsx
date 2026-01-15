import React, { useState } from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';
import { PageWrapper, PageBackground } from '../../components/common';
import { SavedJobsList } from '../../components/common/cards';
import type { SavedJob } from '../../components/common/cards';

const SavedJobsPage: React.FC = () => {
  const { tSync } = useTranslation();
  const [jobs, setJobs] = useState<SavedJob[]>([
    {
      id: 1,
      title: 'Fullstackutvecklare',
      company: 'High Tech AB',
      location: 'Stockholm',
      workType: 'Heltid',
      lastApplicationDate: '2025-11-19',
      isActionItem: true,
      saved: true,
    },
    {
      id: 2,
      title: 'Tech Lead',
      company: 'Futuristica',
      location: 'Göteborg',
      workType: 'Heltid',
      lastApplicationDate: '2025-12-23',
      isActionItem: false,
      saved: true,
    },
    {
      id: 3,
      title: 'Frontendutvecklare i Angular',
      company: 'Wyswwigg AB',
      location: 'Göteborg',
      workType: 'Heltid',
      lastApplicationDate: '2025-11-19',
      isActionItem: false,
      saved: true,
    },
  ]);

  const handleSave = (id: number) => {
    setJobs(jobs.map(j => 
      j.id === id ? { ...j, saved: !j.saved } : j
    ));
  };

  const handleDelete = (id: number) => {
    setJobs(jobs.filter(j => j.id !== id));
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
          />
        </div>
      </PageWrapper>
    </>
  );
};

export default SavedJobsPage;
