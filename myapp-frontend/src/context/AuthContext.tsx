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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export { AuthContext };
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

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

  const login = (user: AuthUser) => {
    setUser(user);
    localStorage.setItem("authUser", JSON.stringify(user));
  };
  
  const logout = async () => {
    try {
      // Call backend to blacklist refresh token
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
      // Clear tokens and user state regardless of API call result
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('authUser');
      setUser(null);
    }
  };

  if (loading) {
    return <div>Laddar...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
