import { useState, useEffect, useCallback } from 'react';
import { LocalDbService } from './LocalDbService';
import type { Account, Candidate, CV } from './types';

interface HookResult<T> {
  data: T;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useLocalAccount(): HookResult<Account | undefined> {
  const [data, setData] = useState<Account | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setData(await LocalDbService.getAccount());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, error, refresh };
}

export function useLocalCandidates(accountId: string | undefined): HookResult<Candidate[]> {
  const [data, setData] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setData(accountId ? await LocalDbService.getCandidatesForAccount(accountId) : []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, error, refresh };
}

export function useLocalCVs(candidateId: string | undefined): HookResult<CV[]> {
  const [data, setData] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setData(candidateId ? await LocalDbService.getCVsForCandidate(candidateId) : []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, error, refresh };
}
