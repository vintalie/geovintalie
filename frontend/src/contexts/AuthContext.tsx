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
          // A API retorna { message, user } ou { token, user } dependendo do endpoint
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
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    // Após salvar o token, buscar dados do usuário
    me()
      .then((response) => {
        const userData = response.data.user ?? response.data;
        setUser(userData);
      })
      .catch(() => {
        // Se falhar, pelo menos definimos que há um token
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
