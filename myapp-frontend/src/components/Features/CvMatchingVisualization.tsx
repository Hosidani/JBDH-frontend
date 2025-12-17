import React from 'react';

interface MatchData {
  requirement: string;
  category: string;
  importance: number;
  // V2/V3 fields
  vectorSimilarity: number;
  // keywordScore: number; // Temporarily disabled
  weightedScore: number;
  // V4 fields
  matchedCvSkill?: string;
  cvSkillLevel?: number;
  finalSimilarity?: number;
}

interface ProfessionMatch {
  score: number;
  cvProfession: {
    main: string;
    sub: string;
    specialty: string;
  };
  jobProfession: {
    main: string;
    sub: string;
    specialty: string;
  };
}

interface Breakdown {
  skillsWeight: number;
  professionWeight: number;
  skillsScore: number;
  professionScore: number;
}

interface CvMatchingVisualizationProps {
  // V2 format compatibility
  matchPercentage?: number;
  // V3 format
  totalMatchPercentage?: number;
  skillsMatchPercentage?: number;
  professionMatch?: ProfessionMatch;
  breakdown?: Breakdown;
  // V4 format
  totalScore?: number;
  skillsScore?: number;
  professionScore?: number;
  cvProfession?: {
    main: string;
    sub: string;
    specialty: string;
  };
  jobProfession?: {
    main: string;
    sub: string;
    specialty: string;
  };
  // Common fields
  totalRequirements: number;
  matches: MatchData[];
  topGaps?: MatchData[];
}

// Sorting functionality temporarily disabled

const CvMatchingVisualization: React.FC<CvMatchingVisualizationProps> = ({
  matchPercentage,
  totalMatchPercentage,
  skillsMatchPercentage,
  professionMatch,
  breakdown,
  totalScore,
  skillsScore,
  professionScore,
  cvProfession,
  jobProfession,
  totalRequirements,
  matches,
  topGaps,
}) => {
  const getMatchLabel = (vectorSimilarity: number): string => {
    // Temporarily disabled keyword-based labeling - now only uses vector similarity
    if (vectorSimilarity >= 0.7) {
      return 'Strong semantic match';
    }
    return '';
  };

  const getLabelColor = (label: string): string => {
    switch (label) {
      case 'Strong match':
        return 'text-green-700 bg-green-100';
      case 'Matches by meaning, not words':
        return 'text-blue-700 bg-blue-100';
      case 'Keyword hit, weak context':
        return 'text-orange-700 bg-orange-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  // Display matches in original order without sorting

  const MatchCard: React.FC<{ match: MatchData; isGap?: boolean }> = ({ match, isGap = false }) => {
    const label = getMatchLabel(match.vectorSimilarity || match.finalSimilarity || 0);
    const labelColor = getLabelColor(label);
    const isV4Format = match.matchedCvSkill !== undefined;

    // Category color mapping for V4
    const getCategoryColor = (category: string) => {
      switch (category) {
        case 'skill': return 'bg-purple-100 text-purple-700';
        case 'experience': return 'bg-blue-100 text-blue-700';
        case 'degree': return 'bg-green-100 text-green-700';
        case 'certification': return 'bg-yellow-100 text-yellow-700';
        case 'language': return 'bg-pink-100 text-pink-700';
        default: return 'bg-gray-100 text-gray-700';
      }
    };

    return (
      <div className={`p-4 rounded-lg border ${isGap ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'} shadow-sm`}>
        <div className="mb-3">
          <h4 className="font-medium text-gray-900 mb-1">{match.requirement}</h4>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(match.category)}`}>
              {match.category}
            </span>
            <span className="text-xs text-gray-500">Importance: {match.importance}</span>
            {isV4Format && match.matchedCvSkill && (
              <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700">
                Matched: {match.matchedCvSkill} (Level {match.cvSkillLevel})
              </span>
            )}
            {label && (
              <span className={`text-xs px-2 py-1 rounded ${labelColor}`}>
                {label}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {/* Vector/Semantic Similarity Bar */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">
                {isV4Format ? 'Vector Similarity' : 'Semantic match'}
              </span>
              <span className="text-sm text-gray-600">
                {((match.vectorSimilarity || match.finalSimilarity || 0) * 100).toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(match.vectorSimilarity || match.finalSimilarity || 0) * 100}%` }}
              />
            </div>
          </div>

          {/* Keyword Match Bar - Temporarily disabled */}
          {/* {(!isV4Format || match.keywordScore !== undefined) && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Keyword match</span>
                <span className="text-sm text-gray-600">{((match.keywordScore || 0) * 100).toFixed(2)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(match.keywordScore || 0) * 100}%` }}
                />
              </div>
            </div>
          )*/} 

          {/* Weighted Score */}
          <div className="text-xs text-gray-500">
            Weighted Score: {match.weightedScore.toFixed(2)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">CV Matching Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold text-center">
            Overall Score: {(totalScore || totalMatchPercentage || matchPercentage || 0).toFixed(1)}%
          </div>
          {(skillsScore !== undefined || skillsMatchPercentage !== undefined) && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold text-center">
              Skills Score: {(skillsScore || skillsMatchPercentage || 0).toFixed(1)}%
            </div>
          )}
          {(professionScore !== undefined || professionMatch) && (
            <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-semibold text-center">
              Profession Score: {(professionScore || professionMatch?.score || 0).toFixed(1)}%
            </div>
          )}
        </div>
        <div className="text-gray-600 text-center">
          {matches.length} of {totalRequirements} requirements analyzed
        </div>
      </div>



      {/* Legend - Keyword references temporarily removed */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Legend</h3>
        <div className="grid grid-cols-1 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-blue-500 rounded"></div>
            <span>Vector Similarity - AI understands meaning and context between CV and job requirements</span>
          </div>
          {/* Temporarily disabled keyword legend */}
          {/* <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-green-500 rounded"></div>
            <span>Keyword match - Exact word/phrase matches</span>
          </div> */}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 text-xs">
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Strong semantic match - High vector similarity (≥70%)</span>
          {/* Temporarily disabled keyword-based labels */}
          {/* <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Strong match - Both high</span>
          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">Keyword-only - Words without context</span> */}
        </div>
      </div>

      {/* Breakdown Section - V3 format */}
      {breakdown && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Score Breakdown</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-sm">
              <div className="flex justify-between mb-1">
                <span>Skills Score ({breakdown.skillsWeight}% weight):</span>
                <span className="font-semibold">{breakdown.skillsScore.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${breakdown.skillsScore}%` }}
                />
              </div>
            </div>
            <div className="text-sm">
              <div className="flex justify-between mb-1">
                <span>Profession Score ({breakdown.professionWeight}% weight):</span>
                <span className="font-semibold">{breakdown.professionScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${breakdown.professionScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profession Match Section - V3/V4 format */}
      {(professionMatch || (cvProfession && jobProfession)) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Profession Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-white rounded border">
              <h4 className="font-medium text-gray-800 mb-2">CV Profession</h4>
              <div className="space-y-1">
                <div><span className="text-gray-600">Main:</span> <span className="font-medium">{cvProfession?.main || professionMatch?.cvProfession?.main}</span></div>
                <div><span className="text-gray-600">Sub:</span> <span className="font-medium">{cvProfession?.sub || professionMatch?.cvProfession?.sub}</span></div>
                <div><span className="text-gray-600">Specialty:</span> <span className="font-medium">{cvProfession?.specialty || professionMatch?.cvProfession?.specialty}</span></div>
              </div>
            </div>
            <div className="p-3 bg-white rounded border">
              <h4 className="font-medium text-gray-800 mb-2">Job Profession</h4>
              <div className="space-y-1">
                <div><span className="text-gray-600">Main:</span> <span className="font-medium">{jobProfession?.main || professionMatch?.jobProfession?.main}</span></div>
                <div><span className="text-gray-600">Sub:</span> <span className="font-medium">{jobProfession?.sub || professionMatch?.jobProfession?.sub}</span></div>
                <div><span className="text-gray-600">Specialty:</span> <span className="font-medium">{jobProfession?.specialty || professionMatch?.jobProfession?.specialty}</span></div>
              </div>
            </div>
          </div>
          <div className="mt-3 text-center">
            <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
              (professionScore || professionMatch?.score || 0) >= 80 ? 'bg-green-100 text-green-800' :
              (professionScore || professionMatch?.score || 0) >= 50 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              Match Score: {(professionScore || professionMatch?.score || 0).toFixed(1)}/100
            </span>
          </div>
        </div>
      )}

      {/* Matches Section */}
      {matches.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Matched Requirements ({matches.length})
          </h3>
          <div className="grid gap-4">
            {matches.map((match, index) => (
              <MatchCard key={index} match={match} />
            ))}
          </div>
        </div>
      )}

      {/* Top Gaps Section */}
      {topGaps && topGaps.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Top Gaps to Address ({topGaps.length})
          </h3>
          <div className="grid gap-4">
            {topGaps.map((gap, index) => (
              <MatchCard key={`gap-${index}`} match={gap} isGap={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CvMatchingVisualization;