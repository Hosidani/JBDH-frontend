import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export interface AuthUser {
  email: string;
  roles?: string[];
  // Add more fields as needed
}

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, check session with backend
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5071/api/profile', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUser({ email: data.email, roles: data.roles });
          localStorage.setItem("authUser", JSON.stringify({ email: data.email, roles: data.roles }));
        } else {
          setUser(null);
          localStorage.removeItem("authUser");
        }
      } catch {
        setUser(null);
        localStorage.removeItem("authUser");
      } finally {
        setLoading(false);
      }
    };
    checkSession();
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
  const logout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
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
