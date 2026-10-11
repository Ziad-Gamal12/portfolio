/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-color)',
        surface: 'var(--surface-color)',
        'surface-elevated': 'var(--surface-elevated)',
        border: 'var(--border-color)',
        text: 'var(--text-color)',
        secondary: 'var(--secondary-text)',
        primary: {
          DEFAULT: 'var(--primary-color)',
          glow: 'var(--primary-glow)',
        },
        accent: 'var(--accent-color)',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        pill: '999px',
      },
      maxWidth: {
        content: '1120px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      transitionTimingFunction: {
        'smooth-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
