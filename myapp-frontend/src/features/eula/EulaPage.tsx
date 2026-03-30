import React from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';
import { PageWrapper } from '../../components/common';
import { SectionCard } from '../../components/common/SectionCard';
import { Heading } from '../../components/ui/Heading';

const EulaPage: React.FC = () => {
  const { tSync } = useTranslation();
  return (
    <PageWrapper>
      <SectionCard>
        <Heading level={2} className="mb-4">{tSync('eulaPage_title')}</Heading>
        <p>{tSync('eulaPage_comingSoon')}</p>
      </SectionCard>
    </PageWrapper>
  );
};

export default EulaPage;
