import React, { createContext, useContext, useState, ReactNode } from 'react';
import { lightColors, darkColors } from '../theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  colors: typeof lightColors;
  toggle: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const toggle = () => setMode(m => m === 'light' ? 'dark' : 'light');
  return (
    <ThemeContext.Provider value={{ mode, colors, toggle, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
