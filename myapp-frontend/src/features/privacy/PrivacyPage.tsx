import React from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';
import { PageWrapper, PageBackground } from '../../components/common';
import { SectionCard } from '../../components/common/SectionCard';
import MarkdownRenderer from '../../components/common/MarkdownRenderer';
import privacySv from '../../content/privacy.sv.md?raw';
import privacyEn from '../../content/privacy.en.md?raw';
import laptopWorkImg from '../../assets/img/Laptop-work.png';

const PrivacyPage: React.FC = () => {
  const { language } = useTranslation();
  const content = language === 'sv' ? privacySv : privacyEn;
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

export default PrivacyPage;
