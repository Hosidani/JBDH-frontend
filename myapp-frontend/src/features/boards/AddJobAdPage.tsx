import React from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';
import PageWrapper from '../../components/PageWrapper';

const AddJobAdPage: React.FC = () => {
  const { tSync } = useTranslation();
  return (
    <PageWrapper>
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">{tSync('addJobAdPage_title')}</h2>
        <p>{tSync('addJobAdPage_comingSoon')}</p>
      </div>
    </PageWrapper>
  );
};

export default AddJobAdPage;
