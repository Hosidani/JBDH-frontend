import { getDb } from './db';
import type { Account, Candidate, CV } from './types';

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
}
