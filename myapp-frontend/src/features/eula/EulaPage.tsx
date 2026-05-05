import React from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';
import { PageWrapper, PageBackground } from '../../components/common';
import { SectionCard } from '../../components/common/SectionCard';
import MarkdownRenderer from '../../components/common/MarkdownRenderer';
import eulaSv from '../../content/eula.sv.md?raw';
import eulaEn from '../../content/eula.en.md?raw';
import laptopWorkImg from '../../assets/img/Laptop-work.png';

const EulaPage: React.FC = () => {
  const { language } = useTranslation();
  const content = language === 'sv' ? eulaSv : eulaEn;
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

export default EulaPage;
