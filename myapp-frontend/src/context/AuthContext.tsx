import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { ApiService } from "../services/ApiService";

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

  // Restore user from localStorage on mount and validate session
  useEffect(() => {
    const restoreAndValidateSession = async () => {
      const stored = localStorage.getItem("authUser");
      if (stored) {
        try {
          const profile = await ApiService.getMyProfile();
          const storedUser = JSON.parse(stored);
          setUser({ ...storedUser, name: profile.name || storedUser.name });
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

  // Enrich user.name after login if backend didn't include it
  useEffect(() => {
    if (user && !user.name) {
      ApiService.getMyProfile()
        .then(profile => {
          if (profile.name) setUser(prev => prev ? { ...prev, name: profile.name } : prev);
        })
        .catch(() => {});
    }
  }, [user?.email]);

  // Enrich user.roles after login if backend didn't include them
  useEffect(() => {
    if (user && user.roles === undefined) {
      ApiService.getAccountSettings()
        .then(settings => {
          setUser(prev => prev ? { ...prev, roles: settings.roles ?? [] } : prev);
        })
        .catch(() => {
          setUser(prev => prev ? { ...prev, roles: [] } : prev);
        });
    }
  }, [user?.email]);

  useEffect(() => {
    const handler = () => {
      setUser(null);
      localStorage.removeItem('authUser');
      setSessionExpired(true);
    };
    window.addEventListener('sessionExpired', handler);
    return () => window.removeEventListener('sessionExpired', handler);
  }, []);

  const login = (user: AuthUser) => {
    setUser(user);
    setSessionExpired(false);
    localStorage.setItem("authUser", JSON.stringify(user));
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
  };
  const clearSessionExpired = () => setSessionExpired(false);

  const refreshRoles = async () => {
    try {
      const settings = await ApiService.getAccountSettings();
      setUser(prev => prev ? { ...prev, roles: settings.roles ?? [] } : prev);
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
