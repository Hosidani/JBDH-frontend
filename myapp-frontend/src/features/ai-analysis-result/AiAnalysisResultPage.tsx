import React from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { PageWrapper, PageBackground, FieldAnalysisCard, Section, BulletList } from '../../components/common';
import { SectionCard } from '../../components/common/SectionCard';
import presentationImg from '../../assets/img/Presentation.png';
import { useTranslation } from '../../hooks/TranslationProvider';
import type { SseAnalysisResult, Bilingual } from '../../types/analysis';

interface AiAnalysisState {
  sseResult: SseAnalysisResult;
  title?: string;
}

const AiAnalysisResultPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useTranslation();
  const state = (location.state ?? {}) as Partial<AiAnalysisState>;
  const { sseResult, title } = state;

  /** Resolve a bilingual value to the current UI language. */
  const resolve = (value: Bilingual | string | undefined): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return language === 'en' ? (value.en || value.sv) : (value.sv || value.en);
  };

  if (!sseResult) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <PageBackground imageUrl={presentationImg} opacity={1} blur={0} className="!z-[2]" />
      <PageWrapper className="relative z-10">
        <SectionCard>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-4"
        >
          ← Tillbaka
        </button>

        <h2 className="text-2xl font-bold text-blue-800 mb-6 border-b border-blue-200 pb-3">
          AI-analys – {title || 'Sammanfattning'}
        </h2>

        {/* Field analysis (Template 6) */}
        {sseResult.field_analysis && (
          <FieldAnalysisCard fieldAnalysis={sseResult.field_analysis} lang={language} />
        )}

        {/* Skills similarity — big score */}
        {typeof sseResult.skills_vector_similarity === 'number' && (
          <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border-l-4 border-emerald-400">
            <span className="text-4xl font-black text-emerald-700">
              {Number(sseResult.skills_vector_similarity).toFixed(1)}%
            </span>
            <span className="ml-3 text-slate-700 font-semibold">
              {language === 'en' ? 'Competency similarity (CV vs Job)' : 'Kompetenslikhet (CV vs Jobbannons)'}
            </span>
          </div>
        )}

        {sseResult.summary && (
          <Section title={language === 'en' ? 'Summary' : 'Sammanfattning'}>
            <p className="text-gray-800 bg-blue-50 rounded p-3 border border-blue-100 text-sm">{resolve(sseResult.summary)}</p>
          </Section>
        )}

        {Array.isArray(sseResult.matching_skills) && sseResult.matching_skills.length > 0 && (
          <Section title={language === 'en' ? 'Matching skills' : 'Matchande kompetenser'}>
            <BulletList items={sseResult.matching_skills} />
          </Section>
        )}

        {Array.isArray(sseResult.missing_requirements) && sseResult.missing_requirements.length > 0 && (
          <Section title={language === 'en' ? 'Missing requirements' : 'Saknade krav'}>
            <BulletList items={sseResult.missing_requirements} />
          </Section>
        )}

        {Array.isArray(sseResult.relevant_experiences) && sseResult.relevant_experiences.length > 0 && (
          <Section title={language === 'en' ? 'Relevant experiences' : 'Relevanta erfarenheter'}>
            <BulletList items={sseResult.relevant_experiences} />
          </Section>
        )}

        {Array.isArray(sseResult.education_and_certifications) && sseResult.education_and_certifications.length > 0 && (
          <Section title={language === 'en' ? 'Education & certifications' : 'Utbildning & certifieringar'}>
            <BulletList items={sseResult.education_and_certifications} />
          </Section>
        )}

        {Array.isArray(sseResult.strengths) && sseResult.strengths.length > 0 && (
          <Section title={language === 'en' ? 'Strengths' : 'Styrkor'}>
            <ul className="list-disc ml-6 text-gray-900 space-y-1 text-sm">
              {sseResult.strengths.map((item, i) => <li key={i}>{resolve(item)}</li>)}
            </ul>
          </Section>
        )}

        {Array.isArray(sseResult.gaps) && sseResult.gaps.length > 0 && (
          <Section title={language === 'en' ? 'Gaps' : 'Luckor'}>
            <ul className="list-disc ml-6 text-gray-900 space-y-1 text-sm">
              {sseResult.gaps.map((item, i) => <li key={i}>{resolve(item)}</li>)}
            </ul>
          </Section>
        )}

      </SectionCard>
      </PageWrapper>
    </>
  );
};

export default AiAnalysisResultPage;
