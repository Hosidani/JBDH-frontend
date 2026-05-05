import React from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';
import { PageWrapper, PageBackground } from '../../components/common';
import { SectionCard } from '../../components/common/SectionCard';
import MarkdownRenderer from '../../components/common/MarkdownRenderer';
import termsSv from '../../content/terms.sv.md?raw';
import termsEn from '../../content/terms.en.md?raw';
import laptopWorkImg from '../../assets/img/Laptop-work.png';

const TermsPage: React.FC = () => {
  const { language } = useTranslation();
  const content = language === 'sv' ? termsSv : termsEn;
  return (
    <>
      <PageBackground imageUrl={laptopWorkImg} opacity={1} blur={0} />
      <PageWrapper className="relative z-10">
        <SectionCard>
          <MarkdownRenderer content={content} />
        </SectionCard>
      </PageWrapper>
    </>
  );
};

export default TermsPage;
