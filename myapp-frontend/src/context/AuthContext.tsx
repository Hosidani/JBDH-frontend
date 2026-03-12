import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { ApiService } from "../services/ApiService";

export interface AuthUser {
  email: string;
  name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  roles: string[];
  login: (user: AuthUser) => void;
  logout: () => void;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = async () => {
    try {
      const profile = await ApiService.getMyProfile();
      setRoles(profile.selected_roles ?? []);
    } catch {
      setRoles([]);
    }
  };

  // Restore user from localStorage on mount and validate session
  useEffect(() => {
    const restoreAndValidateSession = async () => {
      const stored = localStorage.getItem("authUser");
      if (stored) {
        try {
          const profile = await ApiService.getMyProfile();
          setUser(JSON.parse(stored));
          setRoles(profile.selected_roles ?? []);
        } catch (error) {
          console.warn("Session validation failed - clearing stored user:", error);
          localStorage.removeItem("authUser");
          setUser(null);
          setRoles([]);
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

  const login = (user: AuthUser) => {
    setUser(user);
    localStorage.setItem("authUser", JSON.stringify(user));
    fetchRoles();
  };

  const refreshRoles = useCallback(async () => {
    await fetchRoles();
  }, []);

  const logout = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      if (accessToken && refreshToken) {
        await fetch(`${import.meta.env.VITE_API_URL}/Logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('authUser');
      setUser(null);
      setRoles([]);
    }
  };

  if (loading) {
    return <div>Laddar...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, roles, login, logout, refreshRoles }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
