import React from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';
import { PageWrapper } from '../../components/common';
import { SectionCard } from '../../components/common/SectionCard';
import { Heading } from '../../components/ui/Heading';

const ContactPage: React.FC = () => {
  const { tSync } = useTranslation();

  return (
    <PageWrapper>
      <SectionCard>
        <Heading level={2} className="mb-8">{tSync('contactPage_title')}</Heading>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm text-slate-700">

          <div className="flex flex-col gap-1">
            <span className="font-semibold text-slate-900 mb-2">{tSync('contactPage_visit')}</span>
            <span>Håvet</span>
            <span>Lunnaberg</span>
            <span>43897</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-semibold text-slate-900 mb-2">{tSync('contactPage_contact')}</span>
            <a href="mailto:hello@loghouse.dev" className="hover:text-blue-600 transition-colors underline">
              hello@loghouse.dev
            </a>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-semibold text-slate-900 mb-2">{tSync('contactPage_work')}</span>
            <a href="mailto:job@loghouse.dev" className="hover:text-blue-600 transition-colors underline">
              job@loghouse.dev
            </a>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-semibold text-slate-900 mb-2">{tSync('contactPage_follow')}</span>
            <a href="https://www.linkedin.com/company/log-house-ab" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors underline">
              LinkedIn
            </a>
            <a href="https://www.instagram.com/loghouseconsulting/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors underline">
              Instagram
            </a>
          </div>

        </div>
      </SectionCard>
    </PageWrapper>
  );
};

export default ContactPage;
