import { openDB, type IDBPDatabase } from 'idb';
import type { Account, Candidate, CV, Job, Match } from './types';

const DB_NAME = 'jbdh';
const DB_VERSION = 5;

export interface JbdhSchema {
  accounts: {
    key: string;
    value: Account;
    indexes: { 'by-email': string };
  };
  candidates: {
    key: string;
    value: Candidate;
    indexes: { 'by-account': string };
  };
  cvs: {
    key: string;
    value: CV;
    indexes: { 'by-candidate': string };
  };
  settings: {
    key: string;
    value: { key: string; value: string };
  };
  jobs: {
    key: string;
    value: Job;
    indexes: { 'by-backend-id': number };
  };
  matches: {
    key: string;  // `${cv_id}|${job_id}`
    value: Match;
  };
}

let dbPromise: Promise<IDBPDatabase<JbdhSchema>> | null = null;

export function getDb(): Promise<IDBPDatabase<JbdhSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<JbdhSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const accounts = db.createObjectStore('accounts', { keyPath: 'account_id' });
          accounts.createIndex('by-email', 'email', { unique: true });

          const candidates = db.createObjectStore('candidates', { keyPath: 'candidate_id' });
          candidates.createIndex('by-account', 'account_id');

          const cvs = db.createObjectStore('cvs', { keyPath: 'cv_id' });
          cvs.createIndex('by-candidate', 'candidate_id');
        }
        if (oldVersion < 2) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        if (oldVersion < 3) {
          const jobs = db.createObjectStore('jobs', { keyPath: 'job_id' });
          jobs.createIndex('by-backend-id', 'backend_id');
        }
        // v4: accounts/candidates/cvs may be missing on DBs created before local-first
        if (oldVersion < 4) {
          if (!db.objectStoreNames.contains('accounts')) {
            const accounts = db.createObjectStore('accounts', { keyPath: 'account_id' });
            accounts.createIndex('by-email', 'email', { unique: true });
          }
          if (!db.objectStoreNames.contains('candidates')) {
            const candidates = db.createObjectStore('candidates', { keyPath: 'candidate_id' });
            candidates.createIndex('by-account', 'account_id');
          }
          if (!db.objectStoreNames.contains('cvs')) {
            const cvs = db.createObjectStore('cvs', { keyPath: 'cv_id' });
            cvs.createIndex('by-candidate', 'candidate_id');
          }
        }
        // v5: local AI match results store
        if (oldVersion < 5) {
          db.createObjectStore('matches', { keyPath: 'match_id' });
        }
      },
    });
  }
  return dbPromise;
}

export function resetDbForTesting(): void {
  dbPromise = null;
}

export function closeDb(): void {
  if (dbPromise) {
    dbPromise.then(db => db.close()).catch(() => {});
    dbPromise = null;
  }
}
