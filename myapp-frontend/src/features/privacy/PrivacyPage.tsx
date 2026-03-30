import React from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';
import { PageWrapper } from '../../components/common';
import { SectionCard } from '../../components/common/SectionCard';
import { Heading } from '../../components/ui/Heading';

const PrivacyPage: React.FC = () => {
  const { tSync } = useTranslation();
  return (
    <PageWrapper>
      <SectionCard>
        <Heading level={2} className="mb-4">{tSync('privacyPage_title')}</Heading>
        <p>{tSync('privacyPage_comingSoon')}</p>
      </SectionCard>
    </PageWrapper>
  );
};

export default PrivacyPage;
