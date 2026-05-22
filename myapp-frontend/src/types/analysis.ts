import type { FieldAnalysis } from '../components/common/FieldAnalysisCard';

export type SkillItem = string | { name: string; importance?: number; category?: string };

/** Bilingual string returned by DeepSeek (sv + en). */
export interface Bilingual {
  sv: string;
  en: string;
}

export interface SseAnalysisResult {
  summary: Bilingual | string;
  matching_skills: SkillItem[];
  missing_requirements: SkillItem[];
  relevant_experiences: SkillItem[];
  education_and_certifications: SkillItem[];
  strengths: (Bilingual | string)[];
  gaps: (Bilingual | string)[];
  profession_vector_similarity: number;
  skills_vector_similarity: number;
  field_analysis?: FieldAnalysis;
}

export interface AtsResult {
  totalScore: number | null;
  breakdown: Record<string, number>;
  matchedSkills: string[];
  missingSkills: string[];
  bonusSkills: string[];
  recommendations: string[];
}
