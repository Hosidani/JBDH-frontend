import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { LocalDbService } from '../db/LocalDbService';
import { BACKEND_ROLE_TO_IDB } from '../db/types';
import type { Account } from '../db/types';

const IDB_TO_BACKEND = Object.fromEntries(
  Object.entries(BACKEND_ROLE_TO_IDB).map(([k, v]) => [v, k])
);

interface LocalAccountContextType {
  hasLocalAccount: boolean | null; // null = loading
  hasBeAccount: boolean;           // true when local account was seeded from BE (email is set)
  localRoles: string[];            // backend-format roles, e.g. ['User']
  allAccounts: Account[];          // all IDB accounts
  currentAccountId: string | undefined;
  refreshLocalAccount: () => Promise<void>;
}

export const LocalAccountContext = createContext<LocalAccountContextType | undefined>(undefined);

export function LocalAccountProvider({ children }: { children: ReactNode }) {
  const [hasLocalAccount,  setHasLocalAccount]  = useState<boolean | null>(null);
  const [hasBeAccount,     setHasBeAccount]     = useState<boolean>(false);
  const [localRoles,       setLocalRoles]       = useState<string[]>([]);
  const [allAccounts,      setAllAccounts]      = useState<Account[]>([]);
  const [currentAccountId, setCurrentAccountId] = useState<string | undefined>(undefined);

  const refreshLocalAccount = useCallback(async () => {
    try {
      const [account, accounts] = await Promise.all([
        LocalDbService.getAccount(),
        LocalDbService.getAllAccounts(),
      ]);
      setHasLocalAccount(!!account);
      setHasBeAccount(!!(account?.email));
      setLocalRoles(account ? account.role.map(r => IDB_TO_BACKEND[r]).filter(Boolean) : []);
      setAllAccounts(accounts);
      setCurrentAccountId(account?.account_id);
    } catch {
      setHasLocalAccount(false);
      setHasBeAccount(false);
      setLocalRoles([]);
      setAllAccounts([]);
      setCurrentAccountId(undefined);
    }
  }, []);

  useEffect(() => {
    refreshLocalAccount();
  }, [refreshLocalAccount]);

  return (
    <LocalAccountContext.Provider value={{ hasLocalAccount, hasBeAccount, localRoles, allAccounts, currentAccountId, refreshLocalAccount }}>
      {children}
    </LocalAccountContext.Provider>
  );
}

export function useLocalAccountContext(): LocalAccountContextType {
  const ctx = useContext(LocalAccountContext);
  if (!ctx) throw new Error('useLocalAccountContext must be used inside LocalAccountProvider');
  return ctx;
}
