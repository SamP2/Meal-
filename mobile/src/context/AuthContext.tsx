import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  login: (user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_STORAGE_KEY = '@mess_finder_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth from storage on mount
  useEffect(() => {
    loadAuthFromStorage();
  }, []);

  const loadAuthFromStorage = async () => {
    try {
      const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const authUser: AuthUser = JSON.parse(storedAuth);
        setAuthToken(authUser.token);
        setUser(authUser);
        console.log('✅ [Auth] Loaded from storage:', authUser.email, authUser.role);
      }
    } catch (error) {
      console.error('❌ [Auth] Failed to load from storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (u: AuthUser) => {
    try {
      // Set token first for immediate API calls
      setAuthToken(u.token);
      setUser(u);
      
      // Save to storage in background (don't block on this)
      AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u)).catch(error => {
        console.error('❌ [Auth] Failed to save to storage:', error);
        // Continue anyway - auth still works in memory
      });
      
      console.log('✅ [Auth] Login successful:', u.email, u.role);
    } catch (error) {
      console.error('❌ [Auth] Login error:', error);
      // Still set auth even if storage fails
      setAuthToken(u.token);
      setUser(u);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setAuthToken(null);
      setUser(null);
      console.log('✅ [Auth] Logout successful');
    } catch (error) {
      console.error('❌ [Auth] Failed to clear storage:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
