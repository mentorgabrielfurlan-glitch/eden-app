import React, { createContext, useContext, useMemo, useState } from 'react';
import { MD3DarkTheme, MD3LightTheme, Provider as PaperThemeProvider } from 'react-native-paper';

export interface ThemeContextValue {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4EAC6D',
    secondary: '#6CD59F',
    background: '#FFFFFF',
    surface: '#F4F7F9',
    onPrimary: '#FFFFFF',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#88E0B5',
    secondary: '#4EAC6D',
    background: '#0F172A',
    surface: '#1E293B',
    onPrimary: '#0F172A',
  },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const value = useMemo<ThemeContextValue>(() => ({ isDarkMode, toggleTheme }), [isDarkMode]);

  const paperTheme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={value}>
      <PaperThemeProvider theme={paperTheme}>{children}</PaperThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeMode = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeMode deve ser usado dentro de ThemeProvider');
  }
  return ctx;
};
