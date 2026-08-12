'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  const applyThemeToDom = (t: Theme) => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;

    if (t === 'dark') {
      root.classList.add('dark');
      if (body) body.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      if (body) body.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    try {
      localStorage.setItem('idea_lab_theme', t);
    } catch (e) {
      console.error('Failed to save theme to localStorage:', e);
    }
  };

  useEffect(() => {
    setMounted(true);
    let initialTheme: Theme = 'light';
    const savedTheme = localStorage.getItem('idea_lab_theme') as Theme | null;
    if (savedTheme === 'dark' || savedTheme === 'light') {
      initialTheme = savedTheme;
    } else if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      initialTheme = 'dark';
    }
    
    setThemeState(initialTheme);
    applyThemeToDom(initialTheme);
  }, []);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const nextTheme = prev === 'light' ? 'dark' : 'light';
      applyThemeToDom(nextTheme);
      return nextTheme;
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyThemeToDom(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

