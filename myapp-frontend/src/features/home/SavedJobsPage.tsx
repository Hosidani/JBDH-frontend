import React from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';

const SavedJobsPage: React.FC = () => {
  const { tSync } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-2xl font-bold mb-4">{tSync('savedJobsPage_title')}</h1>
      <p className="text-slate-500">{tSync('savedJobsPage_description')}</p>
    </div>
  );
};

export default SavedJobsPage;
