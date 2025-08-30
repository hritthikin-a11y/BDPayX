import React, { createContext, useContext } from 'react';

interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  white: string;
  black: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
}

const lightColors: ThemeColors = {
  primary: '#4A90E2',
  secondary: '#357ABD',
  success: '#28A745',
  warning: '#FD7E14',
  error: '#DC3545',
  info: '#17A2B8',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#2E3A59',
  textSecondary: '#7B8794',
  border: '#E9ECEF',
  white: '#FFFFFF',
  black: '#000000',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const value = {
    colors: lightColors,
    isDark: false,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}