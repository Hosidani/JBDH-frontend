import React from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';

const AddJobAdPage: React.FC = () => {
  const { tSync } = useTranslation();
  return (
    <div className="max-w-2xl mx-auto mt-8 card">
      <h2 className="text-2xl font-bold mb-4">{tSync('addJobAdPage_title')}</h2>
      <p>{tSync('addJobAdPage_comingSoon')}</p>
    </div>
  );
};

export default AddJobAdPage;
