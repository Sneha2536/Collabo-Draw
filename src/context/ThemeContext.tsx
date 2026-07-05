import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: ResolvedTheme; // Keep 'theme' as 'light' | 'dark' to prevent breaking changes in existing components
  preference: ThemePreference; // Expose the current user preference selection
  setTheme: (pref: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read preference from localStorage, fallback to dark
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    const saved = localStorage.getItem('collabodraw_theme_preference');
    if (saved === 'dark' || saved === 'light' || saved === 'system') {
      return saved as ThemePreference;
    }
    // Backward compatibility with legacy theme setting
    const oldSaved = localStorage.getItem('collabodraw_theme');
    if (oldSaved === 'dark' || oldSaved === 'light') {
      return oldSaved as ThemePreference;
    }
    return 'dark';
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    const saved = localStorage.getItem('collabodraw_theme_preference');
    if (saved === 'dark' || saved === 'light') return saved as ResolvedTheme;
    const oldSaved = localStorage.getItem('collabodraw_theme');
    if (oldSaved === 'dark' || oldSaved === 'light') return oldSaved as ResolvedTheme;
    return 'dark';
  });

  // Resolve preference to actual theme (light or dark)
  useEffect(() => {
    const getSystemTheme = (): ResolvedTheme => {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    };

    if (preference === 'system') {
      setResolvedTheme(getSystemTheme());
    } else {
      setResolvedTheme(preference);
    }
  }, [preference]);

  // System theme change listener
  useEffect(() => {
    if (preference !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement;
      const body = window.document.body;
      root.classList.add('theme-transitioning');
      body.classList.add('theme-transitioning');
      
      const newTheme: ResolvedTheme = e.matches ? 'dark' : 'light';
      setResolvedTheme(newTheme);

      setTimeout(() => {
        root.classList.remove('theme-transitioning');
        body.classList.remove('theme-transitioning');
      }, 350);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preference]);

  // Apply actual resolved theme to HTML document & body with temporary performance-safe transition class
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    const hasDarkClass = root.classList.contains('dark') || body.classList.contains('dark');
    
    if ((resolvedTheme === 'dark' && !hasDarkClass) || (resolvedTheme === 'light' && hasDarkClass)) {
      root.classList.add('theme-transitioning');
      body.classList.add('theme-transitioning');
      
      if (resolvedTheme === 'dark') {
        root.classList.add('dark');
        body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
      }

      // Sync legacy key for external scripts/caches
      localStorage.setItem('collabodraw_theme', resolvedTheme);

      const timer = setTimeout(() => {
        root.classList.remove('theme-transitioning');
        body.classList.remove('theme-transitioning');
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [resolvedTheme]);

  // Function to change the theme preference
  const setTheme = (pref: ThemePreference) => {
    setPreferenceState(pref);
    localStorage.setItem('collabodraw_theme_preference', pref);
  };

  // Cycle toggle theme helper: light -> dark -> system -> light
  const toggleTheme = () => {
    if (preference === 'light') {
      setTheme('dark');
    } else if (preference === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: resolvedTheme, preference, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
