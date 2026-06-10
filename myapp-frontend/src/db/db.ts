import { openDB, type IDBPDatabase } from 'idb';
import type { Account, Candidate, CV } from './types';

const DB_NAME = 'jbdh';
const DB_VERSION = 2;

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
      },
    });
  }
  return dbPromise;
}

export function resetDbForTesting(): void {
  dbPromise = null;
}
