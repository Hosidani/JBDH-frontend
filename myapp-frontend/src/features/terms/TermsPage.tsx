import React from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';
import { PageWrapper } from '../../components/common';
import { SectionCard } from '../../components/common/SectionCard';
import MarkdownRenderer from '../../components/common/MarkdownRenderer';
import termsSv from '../../content/terms.sv.md?raw';
import termsEn from '../../content/terms.en.md?raw';

const TermsPage: React.FC = () => {
  const { language } = useTranslation();
  const content = language === 'sv' ? termsSv : termsEn;
  return (
    <PageWrapper>
      <SectionCard>
        <MarkdownRenderer content={content} />
      </SectionCard>
    </PageWrapper>
  );
};

export default TermsPage;
