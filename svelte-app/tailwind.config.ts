import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,svelte,ts,js}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#1e293b',
          light: '#334155',
          dark: '#0f172a',
          deeper: '#020617',
        },
        accent: {
          blue: '#3b82f6',
          green: '#22c55e',
          purple: '#a855f7',
          amber: '#f59e0b',
          red: '#ef4444',
          cyan: '#06b6d4',
          pink: '#ec4899',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
