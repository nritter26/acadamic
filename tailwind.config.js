/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{svelte,ts,js}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#020617',
        card: '#1e293b',
        'card-hover': '#334155',
        text: '#f1f5f9',
        'text-muted': '#64748b',
        'text-secondary': '#94a3b8',
        accent: 'var(--accent)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
}
