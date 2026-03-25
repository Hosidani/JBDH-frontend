import React from 'react';

export interface AIAnalysisCardProps {
  polling: boolean;
  analysis?: any;
  aiResponse?: any;
  aiResponses?: any[];
  tSync: (key: string) => string;
  language: string;
}

const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({
  polling,
  analysis,
  aiResponse,
  aiResponses = [],
  tSync,
  language,
}) => {
  // Parse possibly stringified JSON responses
  const parseMaybeJson = (value: any) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  };

  const pickLang = (obj: any) => {
    if (!obj) return {};
    const key = language === 'sv' ? 'Sv' : 'En';
    const longKey = language === 'sv' ? 'Swedish' : 'English';
    const shortKey = language === 'sv' ? 'sv' : 'en';
    return obj[key] || obj[longKey] || obj[shortKey] || obj; // fallback if already flat
  };

  const normalize = (src: any) => {
    if (!src) return {};
    return {
      bestJobTitlesForUser: src.bestJobTitlesForUser ?? src.BestJobTitlesForUser ?? [],
      reasoningBehindJobTitles:
        src.reasoningBehindJobTitles ?? src.ReasoningBehindJobTitles ?? '',
      hardSkills: src.hardSkills ?? src.HardSkills ?? [],
      softSkills: src.softSkills ?? src.SoftSkills ?? [],
      experiences: src.experiences ?? src.Experiences ?? [],
      educationAndCertifications:
        src.educationAndCertifications ?? src.EducationAndCertifications ?? [],
      createdAt: src.createdAt,
    };
  };

  const selectData = (payload: any) => {
    // Try multiple possible fields the backend might use to store the JSON blob
    // Backend uses ResponseText (PascalCase)
    let raw = payload?.ResponseText ??
      payload?.responseText ??
      payload?.analysis ??
      payload?.aiResponse ??
      payload?.response ??
      payload?.content ??
      payload?.text ??
      payload;
    
    // If raw is an object with nested language keys (En/Sv), it's already the language-keyed object
    // Don't parse it again if it's already an object
    const parsed = typeof raw === 'string' ? parseMaybeJson(raw) : raw;
    
    if (import.meta.env.MODE !== 'production') {
      console.debug('AIAnalysisCard payload raw', raw);
      console.debug('AIAnalysisCard payload parsed', parsed);
      console.debug('AIAnalysisCard selectData input', payload);
    }
    return normalize(pickLang(parsed));
  };

  // Prefer first aiResponse, then analysis prop
  const primary = aiResponses.length > 0
    ? selectData(aiResponses[0])
    : selectData(analysis ?? aiResponse);

  const renderBlock = (d: any) => (
    <div>
      <div className="text-xs text-slate-400 mb-2">
        {d.createdAt ? new Date(d.createdAt).toLocaleString() : ''}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="font-semibold mb-1 text-slate-700">
            {tSync('profilePage_analysis_bestJobTitles_titel')}
          </div>
          <div className="flex flex-wrap gap-2">
            {d.bestJobTitlesForUser?.map((title: string) => (
              <span
                key={title}
                className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold shadow-sm border border-green-200"
              >
                {title}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="font-semibold mb-1 text-slate-700">
            {tSync('profilePage_analysis_reasoning_title')}
          </div>
          <div className="text-slate-700 text-sm bg-slate-50 rounded p-3 border border-slate-100 min-h-[60px]">
            {d.reasoningBehindJobTitles}
          </div>
        </div>
      </div>
      <hr className="my-2 border-slate-200" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="font-semibold mb-1 text-slate-700">
            {tSync('profilePage_analysis_hardSkills_title')}
          </div>
          <div className="flex flex-wrap gap-2">
            {d.hardSkills?.map((skill: string) => (
              <span
                key={skill}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold border border-blue-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="font-semibold mb-1 text-slate-700">
            {tSync('profilePage_analysis_softSkills_title')}
          </div>
          <div className="flex flex-wrap gap-2">
            {d.softSkills?.map((skill: string) => (
              <span
                key={skill}
                className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold border border-purple-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
      <hr className="my-2 border-slate-200" />
      {d.experiences && d.experiences.length > 0 && (
        <div>
          <div className="font-semibold mb-1 text-slate-700">
            {tSync('profilePage_analysis_experiences_title')}
          </div>
          <ul className="space-y-1 mt-1">
            {d.experiences.map((exp: any, idx: number) => (
              <li key={idx} className="text-slate-700 text-sm flex items-center">
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                <span>{exp.title}</span>
                <span className="text-slate-400 ml-2">({exp.duration})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {d.educationAndCertifications && d.educationAndCertifications.length > 0 && (
        <div>
          <div className="font-semibold mb-1 text-slate-700">
            {tSync('profilePage_analysis_educationCerts_title')}
          </div>
          <ul className="space-y-1 mt-1">
            {d.educationAndCertifications.map((ed: string, idx: number) => (
              <li key={idx} className="text-slate-700 text-sm flex items-center">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                <span>{ed}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 min-h-[200px]">
      <h3 className="font-bold text-lg mb-2 text-blue-700">{tSync('profilePage_ai_analysis_title')}</h3>
      {polling ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-blue-600 text-lg font-semibold mb-2">{tSync('profilePage_polling_waiting')}</div>
          <div className="flex gap-1 mt-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <div className="text-slate-500 text-sm mt-4">{tSync('profilePage_polling_hint')}</div>
        </div>
      ) : primary && Object.keys(primary).length > 0 ? (
        renderBlock(primary)
      ) : (
        <div className="text-slate-500 text-sm">{tSync('profilePage_no_ai_analysis_found')}</div>
      )}
    </div>
  );
};

export default AIAnalysisCard;
