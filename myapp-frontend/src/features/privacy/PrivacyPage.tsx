import React from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';
import { PageWrapper } from '../../components/common';
import { SectionCard } from '../../components/common/SectionCard';
import MarkdownRenderer from '../../components/common/MarkdownRenderer';
import privacySv from '../../content/privacy.sv.md?raw';
import privacyEn from '../../content/privacy.en.md?raw';

const PrivacyPage: React.FC = () => {
  const { language } = useTranslation();
  const content = language === 'sv' ? privacySv : privacyEn;
  return (
    <PageWrapper>
      <SectionCard>
        <MarkdownRenderer content={content} />
      </SectionCard>
    </PageWrapper>
  );
};

export default PrivacyPage;
