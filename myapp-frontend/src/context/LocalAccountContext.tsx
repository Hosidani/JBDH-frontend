import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { LocalDbService } from '../db/LocalDbService';
import { BACKEND_ROLE_TO_IDB } from '../db/types';

const IDB_TO_BACKEND = Object.fromEntries(
  Object.entries(BACKEND_ROLE_TO_IDB).map(([k, v]) => [v, k])
);

interface LocalAccountContextType {
  hasLocalAccount: boolean | null; // null = loading
  localRoles: string[];            // backend-format roles, e.g. ['User']
  refreshLocalAccount: () => Promise<void>;
}

export const LocalAccountContext = createContext<LocalAccountContextType | undefined>(undefined);

export function LocalAccountProvider({ children }: { children: ReactNode }) {
  const [hasLocalAccount, setHasLocalAccount] = useState<boolean | null>(null);
  const [localRoles, setLocalRoles] = useState<string[]>([]);

  const refreshLocalAccount = useCallback(async () => {
    try {
      const account = await LocalDbService.getAccount();
      setHasLocalAccount(!!account);
      setLocalRoles(account ? account.role.map(r => IDB_TO_BACKEND[r]).filter(Boolean) : []);
    } catch {
      // DB unavailable or store missing — treat as no local account so
      // RequireLocalAccount can redirect instead of hanging on null
      setHasLocalAccount(false);
      setLocalRoles([]);
    }
  }, []);

  useEffect(() => {
    refreshLocalAccount();
  }, [refreshLocalAccount]);

  return (
    <LocalAccountContext.Provider value={{ hasLocalAccount, localRoles, refreshLocalAccount }}>
      {children}
    </LocalAccountContext.Provider>
  );
}

export function useLocalAccountContext(): LocalAccountContextType {
  const ctx = useContext(LocalAccountContext);
  if (!ctx) throw new Error('useLocalAccountContext must be used inside LocalAccountProvider');
  return ctx;
}
