import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (e?: React.MouseEvent) => void;
  isCustomized: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const prefersReduced = usePrefersReducedMotion();
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = localStorage.getItem('zg_theme') as Theme | null;
    if (saved === 'dark' || saved === 'light') return saved;
    // Follows system setting until user chooses
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  const [isCustomized, setIsCustomized] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('zg_theme');
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  // Listen to system theme changes if not customized by user
  useEffect(() => {
    if (isCustomized) return;
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const handler = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'light' : 'dark');
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [isCustomized]);

  const toggleTheme = (e?: React.MouseEvent) => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('zg_theme', nextTheme);
    setIsCustomized(true);

    const hasViewTransition =
      typeof document !== 'undefined' &&
      'startViewTransition' in document &&
      !prefersReduced;

    if (!hasViewTransition || !e) {
      setTheme(nextTheme);
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // TypeScript declaration for document.startViewTransition
    const doc = document as any;
    const transition = doc.startViewTransition(() => {
      setTheme(nextTheme);
    });

    transition.ready?.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 550,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isCustomized }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
