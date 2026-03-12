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
    if (!obj || typeof obj !== 'object') {
      return {};
    }
    
    // First, check if obj already has the data fields (no language nesting)
    if (obj.BestJobTitlesForUser || obj.bestJobTitlesForUser || obj.HardSkills || obj.hardSkills) {
      return obj; // Already flat, return as-is
    }
    
    // Try to find the language-specific section
    const key = language === 'sv' ? 'Sv' : 'En';
    const longKey = language === 'sv' ? 'Swedish' : 'English';
    const shortKey = language === 'sv' ? 'sv' : 'en';
    
    // Try preferred language first
    let langSection = obj[key] || obj[longKey] || obj[shortKey];
    if (langSection) return langSection;
    
    // If preferred language not found, use any available language
    // This handles cases where only English exists but user wants Swedish (or vice versa)
    if (obj.English) return obj.English;
    if (obj.Swedish) return obj.Swedish;
    if (obj.En) return obj.En;
    if (obj.Sv) return obj.Sv;
    
    // Fallback: return empty object if nothing found
    return {};
  };

  const normalize = (src: any, createdAt?: string) => {
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
      createdAt: createdAt ?? src.createdAt ?? src.created_at,
    };
  };

  const selectData = (payload: any) => {
    if (!payload) {
      return {};
    }
    
    // Prioritize the already-parsed 'analysis' field over raw 'response_text'
    // Backend provides 'analysis' as a parsed object with English/Swedish keys
    // But if analysis is null/undefined, fall back to parsing response_text
    let raw = null;
    
    // Check if analysis exists and is not an empty object
    if (payload.analysis !== null && payload.analysis !== undefined && 
        typeof payload.analysis === 'object' && Object.keys(payload.analysis).length > 0) {
      raw = payload.analysis;
    } else if (payload.response_text) {
      // If analysis is not available, parse response_text
      raw = payload.response_text;
    } else if (payload.responseText) {
      raw = payload.responseText;
    } else if (payload.ResponseText) {
      raw = payload.ResponseText;
    } else {
      raw = payload;
    }
    
    // If raw is an object with nested language keys (En/Sv), it's already the language-keyed object
    // Don't parse it again if it's already an object
    const parsed = typeof raw === 'string' ? parseMaybeJson(raw) : raw;
    
    // Extract createdAt from parent payload if available (it's in aiResponses[0], not in analysis)
    const createdAt = payload?.created_at ?? payload?.createdAt;
    
    const result = normalize(pickLang(parsed), createdAt);
    
    return result;
  };

  // Hantera endast aiResponses
  const primary = aiResponses && aiResponses.length > 0
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

  // Check if primary has actual data (not just empty arrays/strings)
  const hasData = primary && (
    (primary.bestJobTitlesForUser?.length > 0) ||
    (primary.hardSkills?.length > 0) ||
    (primary.softSkills?.length > 0) ||
    (primary.experiences?.length > 0) ||
    (primary.educationAndCertifications?.length > 0) ||
    (primary.reasoningBehindJobTitles?.length > 0)
  );

  return (
    <div className="bg-white border border-blue-200 rounded-xl shadow p-6 mt-4 max-w-2xl mx-auto flex flex-col gap-6 min-h-[200px]">
      <h3 className="font-bold text-lg mb-2 text-blue-700">{tSync('profilePage_ai_analysis_title')}</h3>
      {polling ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-blue-600 text-lg font-semibold mb-2">{tSync('profilePage_polling_waiting')}</div>
          <div className="animate-spin text-4xl">🔄</div>
          <div className="text-slate-500 text-sm mt-4">{tSync('profilePage_polling_hint')}</div>
        </div>
      ) : hasData ? (
        renderBlock(primary)
      ) : (
        <div className="text-slate-500 text-sm">{tSync('profilePage_no_ai_analysis_found')}</div>
      )}
    </div>
  );
};

export default AIAnalysisCard;
