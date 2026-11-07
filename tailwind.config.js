/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: 'rgb(var(--c-bg) / <alpha-value>)',
          surface: 'rgb(var(--c-surface) / <alpha-value>)',
          ink: 'rgb(var(--c-ink) / <alpha-value>)',
          muted: 'rgb(var(--c-muted) / <alpha-value>)',
          line: 'rgb(var(--c-line) / <alpha-value>)',
          line2: 'rgb(var(--c-line2) / <alpha-value>)',
          hover: 'rgb(var(--c-hover) / <alpha-value>)',
          accent: 'rgb(var(--c-accent) / <alpha-value>)',
          secondary: 'rgb(var(--c-accent-secondary) / <alpha-value>)',
          live: 'rgb(var(--c-live) / <alpha-value>)',
          danger: 'rgb(var(--c-danger) / <alpha-value>)',
          warn: 'rgb(var(--c-warn) / <alpha-value>)',
        }
      },
      fontFamily: {
        sans: ['Bricolage Grotesque', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'panel': 'var(--shadow)',
        'glow-accent': '0 0 20px -3px rgb(var(--c-accent) / 0.35)',
        'glow-secondary': '0 0 20px -3px rgb(var(--c-accent-secondary) / 0.35)',
      },
      borderRadius: {
        'component': 'var(--radius-component, 16px)',
        'card': 'var(--radius-card, 18px)',
      }
    },
  },
  plugins: [],
}
