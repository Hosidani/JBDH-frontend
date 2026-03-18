import React from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';
import { PageWrapper } from '../../components/common';
import { SectionCard } from '../../components/common/SectionCard';
import { Heading } from '../../components/ui/Heading';

const AboutPage: React.FC = () => {
  const { tSync } = useTranslation();
  return (
    <PageWrapper>
      <SectionCard>
        <Heading level={2} className="mb-4">{tSync('aboutPage_title')}</Heading>
        <p>{tSync('aboutPage_comingSoon')}</p>
      </SectionCard>
    </PageWrapper>
  );
};

export default AboutPage;
