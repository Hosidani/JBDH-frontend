import { getDb } from './db';
import type { Account, Candidate, CV, Job } from './types';

type AccountInput = Omit<Account, 'account_id'>;
type CandidateInput = Omit<Candidate, 'candidate_id'>;
type CVInput = Omit<CV, 'cv_id'>;

export class LocalDbService {
  // ── Account ────────────────────────────────────────────────────────────────

  static async saveAccount(data: AccountInput): Promise<Account> {
    const db = await getDb();
    const account: Account = { ...data, account_id: crypto.randomUUID() };
    await db.put('accounts', account);
    return account;
  }

  static async getAccount(): Promise<Account | undefined> {
    const db = await getDb();
    const all = await db.getAll('accounts');
    return all[0];
  }

  static async getAccountByEmail(email: string): Promise<Account | undefined> {
    const db = await getDb();
    return db.getFromIndex('accounts', 'by-email', email);
  }

  static async updateAccount(patch: Partial<Omit<Account, 'account_id'>>): Promise<Account | undefined> {
    const existing = await this.getAccount();
    if (!existing) return undefined;
    const updated: Account = { ...existing, ...patch };
    const db = await getDb();
    await db.put('accounts', updated);
    return updated;
  }

  static async deleteAccount(): Promise<void> {
    const existing = await this.getAccount();
    if (!existing) return;
    const db = await getDb();
    await db.delete('accounts', existing.account_id);
  }

  // ── Candidate ──────────────────────────────────────────────────────────────

  static async addCandidate(data: CandidateInput): Promise<Candidate> {
    const db = await getDb();
    const candidate: Candidate = { ...data, candidate_id: crypto.randomUUID() };
    await db.put('candidates', candidate);
    return candidate;
  }

  static async getCandidate(candidateId: string): Promise<Candidate | undefined> {
    const db = await getDb();
    return db.get('candidates', candidateId);
  }

  static async getCandidatesForAccount(accountId: string): Promise<Candidate[]> {
    const db = await getDb();
    return db.getAllFromIndex('candidates', 'by-account', accountId);
  }

  static async updateCandidate(
    candidateId: string,
    patch: Partial<Omit<Candidate, 'candidate_id' | 'account_id'>>,
  ): Promise<Candidate | undefined> {
    const db = await getDb();
    const existing = await db.get('candidates', candidateId);
    if (!existing) return undefined;
    const updated: Candidate = { ...existing, ...patch };
    await db.put('candidates', updated);
    return updated;
  }

  static async deleteCandidate(candidateId: string): Promise<void> {
    const db = await getDb();
    const cvs = await db.getAllFromIndex('cvs', 'by-candidate', candidateId);
    await Promise.all(cvs.map(cv => db.delete('cvs', cv.cv_id)));
    await db.delete('candidates', candidateId);
  }

  // ── CV ─────────────────────────────────────────────────────────────────────

  static async addCV(data: CVInput): Promise<CV> {
    const db = await getDb();
    const cv: CV = { ...data, cv_id: crypto.randomUUID() };
    await db.put('cvs', cv);
    return cv;
  }

  static async getCV(cvId: string): Promise<CV | undefined> {
    const db = await getDb();
    return db.get('cvs', cvId);
  }

  static async getCVsForCandidate(candidateId: string): Promise<CV[]> {
    const db = await getDb();
    return db.getAllFromIndex('cvs', 'by-candidate', candidateId);
  }

  static async getAllCVs(): Promise<CV[]> {
    const db = await getDb();
    return db.getAll('cvs');
  }

  static async updateCV(
    cvId: string,
    patch: Partial<Omit<CV, 'cv_id'>>,
  ): Promise<CV | undefined> {
    const db = await getDb();
    const existing = await db.get('cvs', cvId);
    if (!existing) return undefined;
    const updated: CV = { ...existing, ...patch };
    await db.put('cvs', updated);
    return updated;
  }

  static async deleteCV(cvId: string): Promise<void> {
    const db = await getDb();
    await db.delete('cvs', cvId);
  }

  // ── Job ────────────────────────────────────────────────────────────────────

  static async addJob(data: Omit<Job, 'job_id'>): Promise<Job> {
    const db = await getDb();
    const job: Job = { ...data, job_id: crypto.randomUUID() };
    await db.put('jobs', job);
    return job;
  }

  static async getJobByBackendId(backendId: number): Promise<Job | undefined> {
    const db = await getDb();
    return db.getFromIndex('jobs', 'by-backend-id', backendId);
  }

  static async updateJob(jobId: string, patch: Partial<Omit<Job, 'job_id'>>): Promise<Job | undefined> {
    const db = await getDb();
    const existing = await db.get('jobs', jobId);
    if (!existing) return undefined;
    const updated: Job = { ...existing, ...patch };
    await db.put('jobs', updated);
    return updated;
  }

  static async getAllJobs(): Promise<Job[]> {
    const db = await getDb();
    return db.getAll('jobs');
  }

  static async deleteJob(jobId: string): Promise<void> {
    const db = await getDb();
    await db.delete('jobs', jobId);
  }

  // ── Debug / maintenance ────────────────────────────────────────────────────

  static async cleanOrphanCVs(): Promise<{ deleted: number; titles: string[] }> {
    const db = await getDb();
    const allCandidates = await db.getAll('candidates');
    const candidateIds = new Set(allCandidates.map(c => c.candidate_id));
    const allCvs = await db.getAll('cvs');
    const orphans = allCvs.filter(cv => !candidateIds.has(cv.candidate_id));
    await Promise.all(orphans.map(cv => db.delete('cvs', cv.cv_id)));
    return { deleted: orphans.length, titles: orphans.map(cv => cv.cv_title) };
  }
}

// ── Window exposure for console debugging ────────────────────────────────────

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).dbDebug = {
    cleanOrphanCVs: () => LocalDbService.cleanOrphanCVs().then(r => {
      if (r.deleted === 0) console.log('[dbDebug] Inga orphan-CV hittades.');
      else console.log(`[dbDebug] Raderade ${r.deleted} orphan-CV:`, r.titles);
      return r;
    }),
  };
}
