import React, { createContext, useContext, useState, ReactNode } from 'react';
import { setAuthToken } from '../api/client';

type UserRole = 'student' | 'mess_owner';

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (u: AuthUser) => {
    setAuthToken(u.token);
    setUser(u);
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
