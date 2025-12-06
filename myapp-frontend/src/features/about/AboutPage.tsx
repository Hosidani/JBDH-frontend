import React from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';
import PageWrapper from '../../components/PageWrapper';

const AboutPage: React.FC = () => {
  const { tSync } = useTranslation();
  return (
    <PageWrapper>
      <div className="card">
    <h2 className="text-2xl font-bold mb-4">{tSync('aboutPage_title')}</h2>
        <p>{tSync('aboutPage_comingSoon')}</p>
      </div>
    </PageWrapper>
  );
};

export default AboutPage;
