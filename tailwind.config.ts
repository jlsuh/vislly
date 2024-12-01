import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundColor: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        info: 'rgb(var(--color-info) / <alpha-value>)',
        label: 'rgb(var(--color-label) / <alpha-value>)',
      },
      fontSize: {
        // text-lg | text-md
        lg: 'rgb(var(--font-primary) / <alpha-value>)',
        md: 'rgb(var(--font-label) / <alpha-value>)',
      },
    },
  },
  darkMode: 'selector',
  plugins: [],
};

export default config;
