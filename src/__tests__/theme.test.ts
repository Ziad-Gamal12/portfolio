import { describe, it, expect, beforeEach } from 'vitest';

describe('Theme State and Persistence Logic', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
  });

  function applyTheme(theme: 'dark' | 'light') {
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
    localStorage.setItem('zg_theme', theme);
  }

  function getStoredTheme(): 'dark' | 'light' {
    const saved = localStorage.getItem('zg_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'dark'; // default
  }

  it('defaults to dark when no theme is saved', () => {
    expect(getStoredTheme()).toBe('dark');
  });

  it('correctly toggles and persists dark to light', () => {
    applyTheme('light');
    expect(localStorage.getItem('zg_theme')).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('correctly toggles and persists light to dark', () => {
    applyTheme('light');
    applyTheme('dark');
    expect(localStorage.getItem('zg_theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
