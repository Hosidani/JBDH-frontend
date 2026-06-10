import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { resetDbForTesting } from './db';
import { LocalDbService } from './LocalDbService';
import { useLocalAccount, useLocalCandidates, useLocalCVs } from './useLocalDb';
import type { WorkplaceType, EmploymentType } from './types';

beforeEach(() => {
  (globalThis as unknown as Record<string, unknown>).indexedDB = new IDBFactory();
  resetDbForTesting();
});

// ── useLocalAccount ───────────────────────────────────────────────────────────

describe('useLocalAccount', () => {
  it('returnerar undefined när inget account finns', async () => {
    const { result } = renderHook(() => useLocalAccount());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('returnerar account när det finns sparat', async () => {
    await LocalDbService.saveAccount({
      name: 'Henrik',
      email: 'henrik@example.com',
      telephone: '0701234567',
      role: ['sökande'],
    });

    const { result } = renderHook(() => useLocalAccount());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data?.name).toBe('Henrik');
    expect(result.current.data?.email).toBe('henrik@example.com');
  });

  it('refresh laddar om datat', async () => {
    const { result } = renderHook(() => useLocalAccount());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeUndefined();

    await LocalDbService.saveAccount({ name: 'Ny', email: 'ny@x.com', telephone: '', role: [] });
    await result.current.refresh();

    await waitFor(() => expect(result.current.data?.name).toBe('Ny'));
  });
});

// ── useLocalCandidates ────────────────────────────────────────────────────────

describe('useLocalCandidates', () => {
  it('returnerar tom lista när accountId är undefined', async () => {
    const { result } = renderHook(() => useLocalCandidates(undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([]);
  });

  it('returnerar kandidater för ett account', async () => {
    const account = await LocalDbService.saveAccount({
      name: 'Owner', email: 'o@x.com', telephone: '', role: [],
    });
    const base = {
      account_id: account.account_id,
      email: '', telephone: '', title: '', location: '',
      workplace: [] as WorkplaceType[], employment_type: [] as EmploymentType[],
      available_from: '', travel: false, searchable: false,
    };
    await LocalDbService.addCandidate({ ...base, name: 'Anna' });
    await LocalDbService.addCandidate({ ...base, name: 'Björn' });

    const { result } = renderHook(() => useLocalCandidates(account.account_id));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data.map(c => c.name)).toContain('Anna');
    expect(result.current.data.map(c => c.name)).toContain('Björn');
  });

  it('uppdaterar listan när accountId ändras', async () => {
    const a1 = await LocalDbService.saveAccount({ name: 'A1', email: 'a1@x.com', telephone: '', role: [] });
    const a2 = await LocalDbService.saveAccount({ name: 'A2', email: 'a2@x.com', telephone: '', role: [] });
    const base = { email: '', telephone: '', title: '', location: '', workplace: [] as WorkplaceType[], employment_type: [] as EmploymentType[], available_from: '', travel: false, searchable: false };
    await LocalDbService.addCandidate({ ...base, account_id: a1.account_id, name: 'K1' });
    await LocalDbService.addCandidate({ ...base, account_id: a2.account_id, name: 'K2' });

    let accountId = a1.account_id;
    const { result, rerender } = renderHook(() => useLocalCandidates(accountId));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data[0].name).toBe('K1');

    accountId = a2.account_id;
    rerender();
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data[0].name).toBe('K2');
  });
});

// ── useLocalCVs ───────────────────────────────────────────────────────────────

describe('useLocalCVs', () => {
  it('returnerar tom lista när candidateId är undefined', async () => {
    const { result } = renderHook(() => useLocalCVs(undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([]);
  });

  it('returnerar CVn för en kandidat', async () => {
    const account = await LocalDbService.saveAccount({ name: 'O', email: 'cv@x.com', telephone: '', role: [] });
    const candidate = await LocalDbService.addCandidate({
      account_id: account.account_id, name: 'K', email: '', telephone: '',
      title: '', location: '', workplace: [], employment_type: [],
      available_from: '', travel: false, searchable: false,
    });
    const base = { candidate_id: candidate.candidate_id, cv_json: '', cv_file: null, cv_file_type: '', cv_published: false };
    await LocalDbService.addCV({ ...base, cv_anonymized: 'CV 1' });
    await LocalDbService.addCV({ ...base, cv_anonymized: 'CV 2' });

    const { result } = renderHook(() => useLocalCVs(candidate.candidate_id));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toHaveLength(2);
  });
});
