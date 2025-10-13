'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get system preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Resolve theme based on current theme setting
  const resolveTheme = useCallback((currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    return currentTheme;
  }, []);

  // Apply theme to document
  const applyTheme = (newResolvedTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    
    if (newResolvedTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    
    setResolvedTheme(newResolvedTheme);
  };

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    
    try {
      const savedTheme = localStorage.getItem('chittagong-bus-theme') as Theme;
      if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
        // Use setTimeout to avoid setState during render
        setTimeout(() => {
          setTheme(savedTheme);
          // Immediately apply the theme to prevent flash
          const newResolvedTheme = resolveTheme(savedTheme);
          applyTheme(newResolvedTheme);
        }, 0);
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, [resolveTheme]);

  // Update resolved theme when theme changes
  useEffect(() => {
    if (!mounted || !isInitialized) return;
    
    const newResolvedTheme = resolveTheme(theme);
    applyTheme(newResolvedTheme);
  }, [theme, mounted, isInitialized, resolveTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted || !isInitialized || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const newResolvedTheme = resolveTheme(theme);
      applyTheme(newResolvedTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted, isInitialized, resolveTheme]);

  // Save theme to localStorage
  const handleSetTheme = (newTheme: Theme) => {
    // Use setTimeout to avoid setState during render
    setTimeout(() => {
      setTheme(newTheme);
      try {
        localStorage.setItem('chittagong-bus-theme', newTheme);
      } catch (error) {
        console.warn('Failed to save theme to localStorage:', error);
      }
    }, 0);
  };

  // Prevent hydration mismatch - show children immediately but with proper theme
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: handleSetTheme,
        resolvedTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Fallback for when ThemeProvider is not available
    // This should only happen during SSR or before the provider is mounted
    return {
      theme: 'system' as Theme,
      setTheme: (theme: Theme) => {
        console.warn('ThemeProvider not found. Cannot set theme:', theme);
      },
      resolvedTheme: 'light' as 'light' | 'dark',
    };
  }
  return context;
}
