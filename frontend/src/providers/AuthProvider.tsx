import React, { createContext, useContext, useEffect, useState } from 'react';
import { client } from '../shared/api/client';
import { fetchMe, blacklistToken } from '../features/auth/api/authApi';
import type { AuthUser } from '../features/auth/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (accessToken: string, refreshToken: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser]                       = useState<AuthUser | null>(null);
  const [loading, setLoading]                 = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      fetchMe()
        .then(setUser)
        .catch(() => {
          // Token invalide/expiré — on nettoie
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          delete client.defaults.headers.common['Authorization'];
          setIsAuthenticated(false);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (accessToken: string, refreshToken: string): Promise<AuthUser> => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    client.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    setIsAuthenticated(true);
    const me = await fetchMe();
    setUser(me);
    return me;
  };

  const logout = async () => {
    const refresh = localStorage.getItem('refreshToken');
    if (refresh) {
      blacklistToken(refresh).catch(() => {});
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete client.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}