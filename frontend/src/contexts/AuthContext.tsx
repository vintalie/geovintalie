import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { me } from '../api/auth';
import type { User, AuthContextData } from '../types';

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      me()
        .then((response) => {
          const userData = response.data.user ?? response.data;
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    // Listen for unauthorized events from axios interceptor
    const handleUnauthorized = () => {
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    me()
      .then((response) => {
        const userData = response.data.user ?? response.data;
        setUser(userData);
      })
      .catch(() => {
        setUser({} as User);
      })
      .finally(() => setLoading(false));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
