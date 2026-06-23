import { getDb } from './db';
import { ApiService } from '../services/ApiService';
import type { Account, Candidate, CV, Job, Match } from './types';

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
    if (all.length === 0) return undefined;
    if (all.length === 1) return all[0];
    const activeId = localStorage.getItem('active_account_id');
    if (activeId) {
      const active = all.find(a => a.account_id === activeId);
      if (active) return active;
    }
    return all[0];
  }

  static async getAllAccounts(): Promise<Account[]> {
    const db = await getDb();
    return db.getAll('accounts');
  }

  static async getAccountById(id: string): Promise<Account | undefined> {
    const db = await getDb();
    return db.get('accounts', id);
  }

  static setActiveAccount(id: string): void {
    localStorage.setItem('active_account_id', id);
  }

  static async deleteAccountById(id: string): Promise<void> {
    const db = await getDb();
    // Cascade: candidates → CVs → matches → candidate → account
    const candidates = await db.getAllFromIndex('candidates', 'by-account', id);
    const allMatches = await db.getAll('matches');
    for (const candidate of candidates) {
      const cvs = await db.getAllFromIndex('cvs', 'by-candidate', candidate.candidate_id);
      const cvIds = new Set(cvs.map(cv => cv.cv_id));
      const matchKeys = allMatches.filter(m => cvIds.has(m.cv_id)).map(m => m.match_id);
      await Promise.all([
        ...matchKeys.map(k => db.delete('matches', k)),
        ...cvs.map(cv => db.delete('cvs', cv.cv_id)),
      ]);
      await db.delete('candidates', candidate.candidate_id);
    }
    await db.delete('accounts', id);
    if (localStorage.getItem('active_account_id') === id) {
      localStorage.removeItem('active_account_id');
    }
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

  static async getOwnCandidate(accountId: string): Promise<Candidate | undefined> {
    const all = await this.getCandidatesForAccount(accountId);
    return all.find(c => c.is_own_candidate === true);
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
    await Promise.allSettled(
      cvs
        .filter(cv => cv.backend_id != null)
        .map(cv => ApiService.deleteExternalCV(cv.backend_id!))
    );
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

  static async getJob(jobId: string): Promise<Job | undefined> {
    const db = await getDb();
    return db.get('jobs', jobId);
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

  // ── Match ──────────────────────────────────────────────────────────────────

  static async setMatch(cvId: string, jobId: string, score: number, matchJson: string): Promise<Match> {
    const db = await getDb();
    const match: Match = {
      match_id: `${cvId}|${jobId}`,
      cv_id: cvId,
      job_id: jobId,
      overall_score: score,
      match_json: matchJson,
      matched_at: new Date().toISOString(),
    };
    await db.put('matches', match);
    return match;
  }

  static async getMatch(cvId: string, jobId: string): Promise<Match | undefined> {
    const db = await getDb();
    return db.get('matches', `${cvId}|${jobId}`);
  }

  static async getAllMatches(): Promise<Match[]> {
    const db = await getDb();
    return db.getAll('matches');
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
