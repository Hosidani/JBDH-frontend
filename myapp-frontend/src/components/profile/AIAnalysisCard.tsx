
import React from 'react';

export interface AIAnalysisCardProps {
  polling: boolean;
  analysis?: any;
  aiResponse?: any;
  tSync: (key: string) => string;
}

const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({ polling, analysis, aiResponse, tSync }) => {
  // Prefer analysis from aiResponse if available
  const data = aiResponse?.analysis || analysis || {};

  return (
    <div className="bg-white border border-blue-200 rounded-xl shadow p-6 mt-4 max-w-2xl mx-auto flex flex-col gap-6 min-h-[200px]">
      <h3 className="font-bold text-lg mb-2 text-blue-700">{tSync('profilePage_ai_analysis_title')}</h3>
      {polling ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-blue-600 text-lg font-semibold mb-2">{tSync('profilePage_polling_waiting')}</div>
          <div className="animate-spin text-4xl">🔄</div>
          <div className="text-slate-500 text-sm mt-4">{tSync('profilePage_polling_hint')}</div>
        </div>
      ) : data && Object.keys(data).length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="font-semibold mb-1 text-slate-700">{tSync('profilePage_analysis_bestJobTitles_titel')}</div>
              <div className="flex flex-wrap gap-2">
                {data.bestJobTitlesForUser?.map((title: string) => (
                  <span key={title} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold shadow-sm border border-green-200">{title}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1 text-slate-700">{tSync('profilePage_analysis_reasoning_title')}</div>
              <div className="text-slate-700 text-sm bg-slate-50 rounded p-3 border border-slate-100 min-h-[60px]">{data.reasoningBehindJobTitles}</div>
            </div>
          </div>
          <hr className="my-2 border-slate-200" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="font-semibold mb-1 text-slate-700">{tSync('profilePage_analysis_hardSkills_title')}</div>
              <div className="flex flex-wrap gap-2">
                {data.hardSkills?.map((skill: string) => (
                  <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold border border-blue-200">{skill}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1 text-slate-700">{tSync('profilePage_analysis_softSkills_title')}</div>
              <div className="flex flex-wrap gap-2">
                {data.softSkills?.map((skill: string) => (
                  <span key={skill} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold border border-purple-200">{skill}</span>
                ))}
              </div>
            </div>
          </div>
          <hr className="my-2 border-slate-200" />
          {data.experiences && data.experiences.length > 0 && (
            <div>
              <div className="font-semibold mb-1 text-slate-700">{tSync('profilePage_analysis_experiences_title')}</div>
              <ul className="space-y-1 mt-1">
                {data.experiences.map((exp: any, idx: number) => (
                  <li key={idx} className="text-slate-700 text-sm flex items-center">
                    <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    <span>{exp.title}</span>
                    <span className="text-slate-400 ml-2">({exp.duration})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.educationAndCertifications && data.educationAndCertifications.length > 0 && (
            <div>
              <div className="font-semibold mb-1 text-slate-700">{tSync('profilePage_analysis_educationCerts_title')}</div>
              <ul className="space-y-1 mt-1">
                {data.educationAndCertifications.map((ed: string, idx: number) => (
                  <li key={idx} className="text-slate-700 text-sm flex items-center">
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    <span>{ed}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className="text-slate-500 text-sm">{tSync('profilePage_no_ai_analysis_found')}</div>
      )}
    </div>
  );
};

export default AIAnalysisCard;
