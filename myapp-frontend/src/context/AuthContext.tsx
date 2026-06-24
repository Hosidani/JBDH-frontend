import { createContext, useContext, useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { ApiService } from "../services/ApiService";
import { LocalDbService } from "../db/LocalDbService";
import { BACKEND_ROLE_TO_IDB } from "../db/types";
import type { Role } from "../db/types";

export interface AuthUser {
  email: string;
  name?: string;
  roles?: string[];
  // Add more fields as needed
}

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  sessionExpired: boolean;
  clearSessionExpired: () => void;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export { AuthContext };
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  // Only true after an explicit login() call — NOT set by session restoration.
  // Used to suppress the "Du har blivit utloggad" dialog for users who never
  // actively logged in (local-first users with stale tokens from old sessions).
  const wasActivelyLoggedIn = useRef(false);

  // Restore user from localStorage on mount and validate session
  useEffect(() => {
    const restoreAndValidateSession = async () => {
      const stored = localStorage.getItem("authUser");
      if (stored) {
        try {
          const profile = await ApiService.getMyProfile();
          const storedUser = JSON.parse(stored);
          setUser({ ...storedUser, name: profile.name || storedUser.name });
          wasActivelyLoggedIn.current = true; // valid session restored → treat as active
        } catch (error) {
          console.warn("Session validation failed - clearing stored user:", error);
          localStorage.removeItem("authUser");
          setUser(null);
        }
      }
      setLoading(false);
    };

    restoreAndValidateSession();
  }, []);

  // Save user to localStorage when changed (except during initial session check)
  useEffect(() => {
    if (!loading) {
      if (user) {
        localStorage.setItem("authUser", JSON.stringify(user));
      } else {
        localStorage.removeItem("authUser");
      }
    }
  }, [user, loading]);

  // Always fetch roles and name from account settings on login — account settings is source of truth.
  // Also seeds IndexedDB Account on first login.
  useEffect(() => {
    if (user) {
      ApiService.getAccountSettings()
        .then(async settings => {
          setUser(prev => prev ? {
            ...prev,
            roles: settings.roles ?? [],
            name: settings.accountName || prev.name,
          } : prev);

          // Seed IndexedDB Account if none exists for this email
          try {
            const email = settings.accountEmail ?? '';
            const existing = await LocalDbService.getAccountByEmail(email);
            if (!existing) {
              await LocalDbService.saveAccount({
                name: settings.accountName ?? '',
                email,
                telephone: settings.accountPhone ?? '',
                role: ((settings.roles ?? []) as string[])
                  .map(r => BACKEND_ROLE_TO_IDB[r])
                  .filter((r): r is Role => !!r),
              });
            }
          } catch (e) {
            console.error('[IndexedDB] Account seeding failed:', e);
          }
        })
        .catch(() => {
          setUser(prev => prev ? { ...prev, roles: prev.roles ?? [] } : prev);
        });
    }
  }, [user?.email]);

  useEffect(() => {
    const handler = () => {
      setUser(null);
      localStorage.removeItem('authUser');
      // Only show the "logged out" dialog if the user explicitly logged in
      // during this session. Stale tokens from a previous session should be
      // cleared silently — the user never consciously logged in.
      if (wasActivelyLoggedIn.current) {
        setSessionExpired(true);
      }
      wasActivelyLoggedIn.current = false;
    };
    window.addEventListener('sessionExpired', handler);
    return () => window.removeEventListener('sessionExpired', handler);
  }, []);

  const login = (user: AuthUser) => {
    setUser(user);
    wasActivelyLoggedIn.current = true;
    setSessionExpired(false);
    localStorage.setItem("authUser", JSON.stringify(user));
  };
  const logout = () => {
    setUser(null);
    wasActivelyLoggedIn.current = false;
    localStorage.removeItem("authUser");
  };
  const clearSessionExpired = () => setSessionExpired(false);

  const refreshRoles = async () => {
    try {
      const settings = await ApiService.getAccountSettings();
      setUser(prev => prev ? {
        ...prev,
        roles: settings.roles ?? [],
        name: settings.accountName || prev.name,
      } : prev);
    } catch {
      // silently ignore — roles remain as-is
    }
  };

  if (loading) {
    return <div>Laddar...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, sessionExpired, clearSessionExpired, refreshRoles }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
