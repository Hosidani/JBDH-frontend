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

export const EMPLOYMENT_TYPES = ['Heltid', 'Deltid', 'Timmar', 'Fastanställd', 'Projekt', 'Konsult'] as const;
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
  portrait?: string;
  personal_qualities?: string[];
  is_own_candidate?: boolean;
}

export interface Job {
  job_id: string;          // UUID, primary key — generated on first save, never changes
  backend_id?: number;     // ID returned from backend
  job_title: string;
  job_channel: string;
  job_description: string;
  job_json: string;        // populated later after analysis
  job_url: string;
}

export interface CV {
  cv_id: string;             // UUID, primary key
  candidate_id: string;      // FK → Candidate
  backend_id?: number;       // ID returned from backend after upload
  cv_title?: string;         // display name / label for this CV
  cv_anonymized: string;
  cv_json: string;
  cv_file: Blob | null;
  cv_file_type: string;      // MIME type, e.g. "application/pdf"
  cv_published: boolean;
}
