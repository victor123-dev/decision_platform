/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--seed-bg)',
        surface: 'var(--seed-surface)',
        'surface-2': 'var(--seed-surface-2)',
        'surface-3': 'var(--seed-surface-3)',
        fg: 'var(--seed-fg)',
        'fg-2': 'var(--seed-fg-2)',
        'fg-3': 'var(--seed-fg-3)',
        'fg-4': 'var(--seed-fg-4)',
        primary: 'var(--seed-primary)',
        'primary-hover': 'var(--seed-primary-hover)',
        accent: 'var(--seed-accent)',
        border: 'var(--seed-border)',
        'border-subtle': 'var(--seed-border-subtle)',
        success: 'var(--seed-success)',
        warning: 'var(--seed-warning)',
        danger: 'var(--seed-danger)',
        info: 'var(--seed-info)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        'xs': 'var(--seed-radius-xs)',
        'sm': 'var(--seed-radius-sm)',
        'md': 'var(--seed-radius-md)',
        'lg': 'var(--seed-radius-lg)',
        'xl': 'var(--seed-radius-xl)',
      },
    },
  },
  plugins: [],
};
