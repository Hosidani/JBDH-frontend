import React from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { PageWrapper, PageBackground } from '../../components/common';
import { SectionCard } from '../../components/common/SectionCard';
import presentationImg from '../../assets/img/Presentation.png';

interface AiAnalysisState {
  sseResult: any;
  vectorResult: any | null;
  title?: string;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-blue-700 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: any[] }) {
  return (
    <ul className="list-disc ml-6 text-gray-900 space-y-1 text-sm">
      {items.map((item, i) => (
        <li key={i}>{typeof item === 'string' ? item : item.name ?? JSON.stringify(item)}</li>
      ))}
    </ul>
  );
}

const AiAnalysisResultPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as Partial<AiAnalysisState>;
  const { sseResult, vectorResult, title } = state;

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

        {vectorResult?.similarityScore !== undefined && (
          <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border-l-4 border-emerald-400">
            <span className="text-4xl font-black text-emerald-700">
              {Number(vectorResult.similarityScore).toFixed(1)}%
            </span>
            <span className="ml-3 text-slate-700 font-semibold">Semantisk likhet (CV vs Jobbannons)</span>
          </div>
        )}

        {typeof sseResult.profession_vector_similarity === 'number' && (
          <p className="mb-2 text-sm">
            <span className="font-semibold">Profession-likhet (vektor): </span>
            {sseResult.profession_vector_similarity}%
          </p>
        )}
        {typeof sseResult.skills_vector_similarity === 'number' && (
          <p className="mb-6 text-sm">
            <span className="font-semibold">Kompetens-likhet (vektor): </span>
            {sseResult.skills_vector_similarity}%
          </p>
        )}

        {sseResult.summary && (
          <Section title="Sammanfattning">
            <p className="text-gray-800 bg-blue-50 rounded p-3 border border-blue-100 text-sm">{sseResult.summary}</p>
          </Section>
        )}

        {Array.isArray(sseResult.matching_skills) && sseResult.matching_skills.length > 0 && (
          <Section title="Matchande kompetenser">
            <BulletList items={sseResult.matching_skills} />
          </Section>
        )}

        {Array.isArray(sseResult.missing_requirements) && sseResult.missing_requirements.length > 0 && (
          <Section title="Saknade krav">
            <BulletList items={sseResult.missing_requirements} />
          </Section>
        )}

        {Array.isArray(sseResult.relevant_experiences) && sseResult.relevant_experiences.length > 0 && (
          <Section title="Relevanta erfarenheter">
            <BulletList items={sseResult.relevant_experiences} />
          </Section>
        )}

        {Array.isArray(sseResult.education_and_certifications) && sseResult.education_and_certifications.length > 0 && (
          <Section title="Utbildning & certifieringar">
            <BulletList items={sseResult.education_and_certifications} />
          </Section>
        )}

        {Array.isArray(sseResult.strengths) && sseResult.strengths.length > 0 && (
          <Section title="Styrkor">
            <BulletList items={sseResult.strengths} />
          </Section>
        )}

        {Array.isArray(sseResult.gaps) && sseResult.gaps.length > 0 && (
          <Section title="Luckor">
            <BulletList items={sseResult.gaps} />
          </Section>
        )}

      </SectionCard>
      </PageWrapper>
    </>
  );
};

export default AiAnalysisResultPage;
