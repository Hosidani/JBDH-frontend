import React from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';
import { PageWrapper } from '../../components/common';

const MatchAdToCvsPage: React.FC = () => {
  const { tSync } = useTranslation();
  return (
    <PageWrapper>
      <div className="card relative z-10">
        <h2 className="text-2xl font-bold mb-4">{tSync('matchAdToCvsPage_title')}</h2>
        <p>{tSync('matchAdToCvsPage_comingSoon')}</p>
      </div>
    </PageWrapper>
  );
};

export default MatchAdToCvsPage;
