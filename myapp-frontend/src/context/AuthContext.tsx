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
          // Try to validate the session by calling an auth-required endpoint
          await ApiService.getMyProfile();
          // If successful, session is valid - restore user
          setUser(JSON.parse(stored));
        } catch (error) {
          // Session is invalid/expired, clear stored user
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

  if (loading) {
    return <div>Laddar...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, sessionExpired, clearSessionExpired }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
