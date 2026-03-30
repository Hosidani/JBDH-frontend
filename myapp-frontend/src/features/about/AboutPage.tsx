import React from 'react';
import { PageWrapper } from '../../components/common';
import { SectionCard } from '../../components/common/SectionCard';
import MarkdownRenderer from '../../components/common/MarkdownRenderer';
import { useTranslation } from '../../hooks/TranslationProvider';
import aboutSv from '../../content/about.sv.md?raw';
import aboutEn from '../../content/about.en.md?raw';

const contentByLanguage: Record<string, string> = {
  sv: aboutSv,
  en: aboutEn,
};

const AboutPage: React.FC = () => {
  const { language } = useTranslation();
  const content = contentByLanguage[language] ?? aboutSv;

  return (
    <PageWrapper>
      <SectionCard>
        <MarkdownRenderer content={content} />
      </SectionCard>
    </PageWrapper>
  );
};

export default AboutPage;
