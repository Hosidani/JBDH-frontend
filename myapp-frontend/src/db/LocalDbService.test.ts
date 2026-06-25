// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { resetDbForTesting } from './db';
import { LocalDbService } from './LocalDbService';
import type { WorkplaceType, EmploymentType } from './types';

beforeEach(() => {
  // Fresh in-memory IndexedDB per test — prevents data bleeding between tests.
  // fake-indexeddb/auto sets up IDBRequest/IDBIndex/etc.; we replace only the
  // factory so each test gets an empty database.
  (globalThis as unknown as Record<string, unknown>).indexedDB = new IDBFactory();
  resetDbForTesting();
});

// ── Account ──────────────────────────────────────────────────────────────────

describe('Account', () => {
  it('sparar och hämtar ett account', async () => {
    const saved = await LocalDbService.saveAccount({
      name: 'Henrik',
      email: 'henrik@example.com',
      telephone: '0701234567',
      role: ['sökande'],
    });
    expect(saved.account_id).toBeTruthy();
    const fetched = await LocalDbService.getAccount();
    expect(fetched?.email).toBe('henrik@example.com');
    expect(fetched?.role).toEqual(['sökande']);
  });

  it('uppdaterar account', async () => {
    await LocalDbService.saveAccount({ name: 'A', email: 'a@x.com', telephone: '', role: [] });
    const updated = await LocalDbService.updateAccount({ name: 'B', role: ['rekryterare'] });
    expect(updated?.name).toBe('B');
    expect(updated?.role).toEqual(['rekryterare']);
    expect(updated?.email).toBe('a@x.com');
  });

  it('returnerar undefined vid updateAccount om inget account finns', async () => {
    const result = await LocalDbService.updateAccount({ name: 'Ghost' });
    expect(result).toBeUndefined();
  });

  it('hämtar account med getAccountByEmail', async () => {
    await LocalDbService.saveAccount({ name: 'Henrik', email: 'henrik@x.com', telephone: '', role: [] });
    const found = await LocalDbService.getAccountByEmail('henrik@x.com');
    expect(found?.name).toBe('Henrik');
  });

  it('returnerar undefined för okänd mejladress', async () => {
    const result = await LocalDbService.getAccountByEmail('ingen@x.com');
    expect(result).toBeUndefined();
  });

  it('skapar inte nytt account om mejladressen redan finns', async () => {
    await LocalDbService.saveAccount({ name: 'Befintlig', email: 'same@x.com', telephone: '', role: [] });
    // Simulerar inloggning med samma e-post en gång till
    const existing = await LocalDbService.getAccountByEmail('same@x.com');
    if (!existing) {
      await LocalDbService.saveAccount({ name: 'Dubbletten', email: 'same@x.com', telephone: '', role: [] });
    }
    const all = await LocalDbService.getAccount();
    expect(all?.name).toBe('Befintlig'); // originalet orört
  });

  it('raderar account', async () => {
    await LocalDbService.saveAccount({ name: 'X', email: 'x@x.com', telephone: '', role: [] });
    await LocalDbService.deleteAccount();
    expect(await LocalDbService.getAccount()).toBeUndefined();
  });
});

// ── Candidate ─────────────────────────────────────────────────────────────────

describe('Candidate', () => {
  it('lägger till och hämtar en kandidat', async () => {
    const account = await LocalDbService.saveAccount({
      name: 'Owner',
      email: 'owner@x.com',
      telephone: '',
      role: [],
    });
    const candidate = await LocalDbService.addCandidate({
      account_id: account.account_id,
      name: 'Anna Andersson',
      email: 'anna@x.com',
      telephone: '',
      title: 'Frontendutvecklare',
      location: 'Göteborg',
      workplace: ['Hybrid'],
      employment_type: ['Heltid'],
      available_from: '2026-09-01',
      travel: false,
      searchable: true,
    });
    expect(candidate.candidate_id).toBeTruthy();
    const fetched = await LocalDbService.getCandidate(candidate.candidate_id);
    expect(fetched?.name).toBe('Anna Andersson');
    expect(fetched?.workplace).toEqual(['Hybrid']);
  });

  it('hämtar alla kandidater för ett account', async () => {
    const account = await LocalDbService.saveAccount({
      name: 'Owner',
      email: 'o@x.com',
      telephone: '',
      role: [],
    });
    const base = {
      account_id: account.account_id,
      email: '',
      telephone: '',
      title: '',
      location: '',
      workplace: [] as WorkplaceType[],
      employment_type: [] as EmploymentType[],
      available_from: '',
      travel: false,
      searchable: false,
    };
    await LocalDbService.addCandidate({ ...base, name: 'Kandidat 1' });
    await LocalDbService.addCandidate({ ...base, name: 'Kandidat 2' });

    const list = await LocalDbService.getCandidatesForAccount(account.account_id);
    expect(list).toHaveLength(2);
    expect(list.map(c => c.name)).toContain('Kandidat 1');
    expect(list.map(c => c.name)).toContain('Kandidat 2');
  });

  it('uppdaterar en kandidat', async () => {
    const account = await LocalDbService.saveAccount({ name: 'O', email: 'o2@x.com', telephone: '', role: [] });
    const c = await LocalDbService.addCandidate({
      account_id: account.account_id,
      name: 'Förnamn',
      email: '',
      telephone: '',
      title: '',
      location: '',
      workplace: [],
      employment_type: [],
      available_from: '',
      travel: false,
      searchable: false,
    });
    const updated = await LocalDbService.updateCandidate(c.candidate_id, {
      title: 'Senior Developer',
      searchable: true,
    });
    expect(updated?.title).toBe('Senior Developer');
    expect(updated?.searchable).toBe(true);
    expect(updated?.name).toBe('Förnamn');
  });

  it('returnerar undefined vid update av okänd kandidat', async () => {
    const result = await LocalDbService.updateCandidate('non-existent-id', { name: 'X' });
    expect(result).toBeUndefined();
  });

  it('raderar en kandidat', async () => {
    const account = await LocalDbService.saveAccount({ name: 'O', email: 'o3@x.com', telephone: '', role: [] });
    const c = await LocalDbService.addCandidate({
      account_id: account.account_id,
      name: 'Radera mig',
      email: '',
      telephone: '',
      title: '',
      location: '',
      workplace: [],
      employment_type: [],
      available_from: '',
      travel: false,
      searchable: false,
    });
    await LocalDbService.deleteCandidate(c.candidate_id);
    expect(await LocalDbService.getCandidate(c.candidate_id)).toBeUndefined();
  });
});

// ── CV ────────────────────────────────────────────────────────────────────────

describe('CV', () => {
  it('lägger till och hämtar ett CV', async () => {
    const account = await LocalDbService.saveAccount({ name: 'O', email: 'cv@x.com', telephone: '', role: [] });
    const candidate = await LocalDbService.addCandidate({
      account_id: account.account_id,
      name: 'CV-kandidat',
      email: '',
      telephone: '',
      title: '',
      location: '',
      workplace: [],
      employment_type: [],
      available_from: '',
      travel: false,
      searchable: false,
    });
    const cv = await LocalDbService.addCV({
      candidate_id: candidate.candidate_id,
      cv_anonymized: 'Anonymiserad text',
      cv_json: '{}',
      cv_file: null,
      cv_file_type: '',
      cv_published: false,
    });
    expect(cv.cv_id).toBeTruthy();
    const fetched = await LocalDbService.getCV(cv.cv_id);
    expect(fetched?.cv_anonymized).toBe('Anonymiserad text');
  });

  it('lagrar och återläser Blob (originalfil)', async () => {
    const account = await LocalDbService.saveAccount({ name: 'O', email: 'blob@x.com', telephone: '', role: [] });
    const candidate = await LocalDbService.addCandidate({
      account_id: account.account_id,
      name: 'Blob-test',
      email: '',
      telephone: '',
      title: '',
      location: '',
      workplace: [],
      employment_type: [],
      available_from: '',
      travel: false,
      searchable: false,
    });
    const pdfBlob = new Blob(['%PDF-1.4 fake content'], { type: 'application/pdf' });
    const cv = await LocalDbService.addCV({
      candidate_id: candidate.candidate_id,
      cv_anonymized: '',
      cv_json: '',
      cv_file: pdfBlob,
      cv_file_type: 'application/pdf',
      cv_published: false,
    });
    const fetched = await LocalDbService.getCV(cv.cv_id);
    expect(fetched?.cv_file).toBeInstanceOf(Blob);
    expect(fetched?.cv_file_type).toBe('application/pdf');
    const text = await (fetched?.cv_file as Blob).text();
    expect(text).toContain('%PDF');
  });

  it('hämtar alla CV för en kandidat', async () => {
    const account = await LocalDbService.saveAccount({ name: 'O', email: 'multi@x.com', telephone: '', role: [] });
    const candidate = await LocalDbService.addCandidate({
      account_id: account.account_id,
      name: 'Multi-CV',
      email: '',
      telephone: '',
      title: '',
      location: '',
      workplace: [],
      employment_type: [],
      available_from: '',
      travel: false,
      searchable: false,
    });
    const base = {
      candidate_id: candidate.candidate_id,
      cv_anonymized: '',
      cv_json: '',
      cv_file: null,
      cv_file_type: '',
      cv_published: false,
    };
    await LocalDbService.addCV({ ...base, cv_anonymized: 'CV 1' });
    await LocalDbService.addCV({ ...base, cv_anonymized: 'CV 2' });

    const list = await LocalDbService.getCVsForCandidate(candidate.candidate_id);
    expect(list).toHaveLength(2);
  });

  it('uppdaterar ett CV', async () => {
    const account = await LocalDbService.saveAccount({ name: 'O', email: 'upd@x.com', telephone: '', role: [] });
    const candidate = await LocalDbService.addCandidate({
      account_id: account.account_id,
      name: 'Uppdaterings-test',
      email: '',
      telephone: '',
      title: '',
      location: '',
      workplace: [],
      employment_type: [],
      available_from: '',
      travel: false,
      searchable: false,
    });
    const cv = await LocalDbService.addCV({
      candidate_id: candidate.candidate_id,
      cv_anonymized: 'Gammal text',
      cv_json: '',
      cv_file: null,
      cv_file_type: '',
      cv_published: false,
    });
    const updated = await LocalDbService.updateCV(cv.cv_id, {
      cv_anonymized: 'Ny text',
      cv_published: true,
    });
    expect(updated?.cv_anonymized).toBe('Ny text');
    expect(updated?.cv_published).toBe(true);
    expect(updated?.candidate_id).toBe(candidate.candidate_id);
  });

  it('raderar ett CV', async () => {
    const account = await LocalDbService.saveAccount({ name: 'O', email: 'del@x.com', telephone: '', role: [] });
    const candidate = await LocalDbService.addCandidate({
      account_id: account.account_id,
      name: 'Del',
      email: '',
      telephone: '',
      title: '',
      location: '',
      workplace: [],
      employment_type: [],
      available_from: '',
      travel: false,
      searchable: false,
    });
    const cv = await LocalDbService.addCV({
      candidate_id: candidate.candidate_id,
      cv_anonymized: '',
      cv_json: '',
      cv_file: null,
      cv_file_type: '',
      cv_published: false,
    });
    await LocalDbService.deleteCV(cv.cv_id);
    expect(await LocalDbService.getCV(cv.cv_id)).toBeUndefined();
  });
});

// ── syncJobsFromBackend ───────────────────────────────────────────────────────

const { mockGetExternalJobAds, mockCreateExternalJobAd } = vi.hoisted(() => ({
  mockGetExternalJobAds: vi.fn(),
  mockCreateExternalJobAd: vi.fn(),
}));

vi.mock('../services/ApiService', () => ({
  ApiService: {
    getExternalJobAds: mockGetExternalJobAds,
    createExternalJobAd: mockCreateExternalJobAd,
  },
}));

describe('syncLocalJobsToBackend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POSTar lokala jobb utan backend_id och uppdaterar backend_id', async () => {
    await LocalDbService.addJob({ job_title: 'Dev', job_description: 'text', job_channel: '', job_json: '', job_url: '' });
    mockCreateExternalJobAd.mockResolvedValue({ id: 201, name: 'Dev', text: 'text', created_at: '' });

    const result = await LocalDbService.syncLocalJobsToBackend();

    expect(result.synced).toBe(1);
    expect(mockCreateExternalJobAd).toHaveBeenCalledWith('text', 'Dev');
    const jobs = await LocalDbService.getAllJobs();
    expect(jobs[0].backend_id).toBe(201);
  });

  it('hoppar över jobb som redan har backend_id', async () => {
    await LocalDbService.addJob({ backend_id: 99, job_title: 'Synkad', job_description: '', job_channel: '', job_json: '', job_url: '' });

    const result = await LocalDbService.syncLocalJobsToBackend();

    expect(result.synced).toBe(0);
    expect(mockCreateExternalJobAd).not.toHaveBeenCalled();
  });

  it('returnerar synced: 0 när inga lokala jobb finns', async () => {
    const result = await LocalDbService.syncLocalJobsToBackend();
    expect(result.synced).toBe(0);
  });
});

describe('syncJobsFromBackend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('importerar nya BE-jobb som saknas lokalt', async () => {
    mockGetExternalJobAds.mockResolvedValue([
      { id: 101, name: 'Backend-dev', text: 'Vi söker en backend-dev...', created_at: '' },
      { id: 102, name: 'Frontend-dev', text: 'Vi söker en frontend-dev...', created_at: '' },
    ]);

    const result = await LocalDbService.syncJobsFromBackend();

    expect(result.added).toBe(2);
    const local = await LocalDbService.getAllJobs();
    expect(local).toHaveLength(2);
    const backendJob = local.find(j => j.backend_id === 101);
    expect(backendJob?.job_title).toBe('Backend-dev');
    expect(backendJob?.job_description).toBe('Vi söker en backend-dev...');
    expect(backendJob?.backend_id).toBe(101);
  });

  it('hoppar över jobb som redan finns lokalt', async () => {
    mockGetExternalJobAds.mockResolvedValue([
      { id: 101, name: 'Backend-dev', text: 'text', created_at: '' },
    ]);
    await LocalDbService.syncJobsFromBackend();

    // Kör igen — samma BE-id ska inte dupliceras
    mockGetExternalJobAds.mockResolvedValue([
      { id: 101, name: 'Backend-dev', text: 'text', created_at: '' },
      { id: 103, name: 'DevOps', text: 'DevOps-text', created_at: '' },
    ]);
    const result = await LocalDbService.syncJobsFromBackend();

    expect(result.added).toBe(1);
    expect(await LocalDbService.getAllJobs()).toHaveLength(2);
  });

  it('returnerar added: 0 när BE är tomt', async () => {
    mockGetExternalJobAds.mockResolvedValue([]);
    const result = await LocalDbService.syncJobsFromBackend();
    expect(result.added).toBe(0);
    expect(await LocalDbService.getAllJobs()).toHaveLength(0);
  });
});
