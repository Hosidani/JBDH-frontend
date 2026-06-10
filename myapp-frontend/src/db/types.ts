export const ROLES = ['sökande', 'säljare', 'rekryterare'] as const;
export type Role = (typeof ROLES)[number];

// Maps backend role names to IndexedDB role names
export const BACKEND_ROLE_TO_IDB: Record<string, Role> = {
  User: 'sökande',
  Recruiter: 'rekryterare',
  Manager: 'säljare',
};

export const WORKPLACE_TYPES = ['På plats', 'Hybrid', 'Distans'] as const;
export type WorkplaceType = (typeof WORKPLACE_TYPES)[number];

export const EMPLOYMENT_TYPES = ['Heltid', 'Deltid', 'Timmar', 'Projekt', 'Konsult'] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export interface Account {
  account_id: string;        // UUID, primary key
  name: string;
  email: string;             // unique
  telephone: string;
  role: Role[];
}

export interface Candidate {
  candidate_id: string;      // UUID, primary key
  account_id: string;        // FK → Account
  name: string;
  email: string;
  telephone: string;
  title: string;
  location: string;
  workplace: WorkplaceType[];
  employment_type: EmploymentType[];
  available_from: string;    // ISO date string, e.g. "2026-09-01"
  travel: boolean;
  searchable: boolean;
}

export interface CV {
  cv_id: string;             // UUID, primary key
  candidate_id: string;      // FK → Candidate
  cv_title?: string;         // display name / label for this CV
  cv_anonymized: string;
  cv_json: string;
  cv_file: Blob | null;
  cv_file_type: string;      // MIME type, e.g. "application/pdf"
  cv_published: boolean;
}
