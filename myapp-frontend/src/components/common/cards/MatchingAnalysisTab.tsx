import React from 'react';

interface MatchingItem {
  id: number;
  label: string;
}

interface MatchingAnalysisProps {
  matches: MatchingItem[];
  nonMatches: MatchingItem[];
  improvements: MatchingItem[];
  coachTips?: string;
}

const MatchingAnalysisTab: React.FC<MatchingAnalysisProps> = ({ 
  matches, 
  nonMatches, 
  improvements, 
  coachTips 
}) => {
  return (
    <div className="space-y-8">
      {/* What matches */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Vad som matchar</h3>
        <div className="space-y-2">
          {matches.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 bg-green-100 rounded-lg"
            >
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-green-400 text-white rounded-full font-bold">
                +
              </span>
              <span className="text-slate-700 font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What doesn't match */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Vad som inte matchar</h3>
        <div className="space-y-2">
          {nonMatches.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 bg-red-100 rounded-lg"
            >
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-red-400 text-white rounded-full font-bold">
                −
              </span>
              <span className="text-slate-700 font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement opportunities */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Förbättringsmöjligheter</h3>
        <div className="space-y-2">
          {improvements.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 bg-yellow-100 rounded-lg"
            >
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-yellow-400 text-slate-700 rounded-full font-bold">
                ✓
              </span>
              <span className="text-slate-700 font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Coach tips */}
      {coachTips && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Tips från coachen</h3>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-slate-700 leading-relaxed">{coachTips}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingAnalysisTab;
