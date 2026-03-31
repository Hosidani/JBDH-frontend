import React from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';
import { PageWrapper } from '../../components/common';
import { SectionCard } from '../../components/common/SectionCard';
import MarkdownRenderer from '../../components/common/MarkdownRenderer';
import eulaSv from '../../content/eula.sv.md?raw';
import eulaEn from '../../content/eula.en.md?raw';

const EulaPage: React.FC = () => {
  const { language } = useTranslation();
  const content = language === 'sv' ? eulaSv : eulaEn;
  return (
    <PageWrapper>
      <SectionCard>
        <MarkdownRenderer content={content} />
      </SectionCard>
    </PageWrapper>
  );
};

export default EulaPage;
