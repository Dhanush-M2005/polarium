import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: 'rgb(var(--tw-color-slate-50) / <alpha-value>)',
          100: 'rgb(var(--tw-color-slate-100) / <alpha-value>)',
          200: 'rgb(var(--tw-color-slate-200) / <alpha-value>)',
          300: 'rgb(var(--tw-color-slate-300) / <alpha-value>)',
          400: 'rgb(var(--tw-color-slate-400) / <alpha-value>)',
          500: 'rgb(var(--tw-color-slate-500) / <alpha-value>)',
          600: 'rgb(var(--tw-color-slate-600) / <alpha-value>)',
          700: 'rgb(var(--tw-color-slate-700) / <alpha-value>)',
          800: 'rgb(var(--tw-color-slate-800) / <alpha-value>)',
          900: 'rgb(var(--tw-color-slate-900) / <alpha-value>)',
          950: 'rgb(var(--tw-color-slate-950) / <alpha-value>)',
        },
        white: 'rgb(var(--tw-color-white) / <alpha-value>)',
        brand: {
          navy: 'rgb(var(--tw-color-brand-navy) / <alpha-value>)',
          navylight: 'rgb(var(--tw-color-brand-navylight) / <alpha-value>)',
          dark: 'rgb(var(--tw-color-brand-dark) / <alpha-value>)',
          orange: 'rgb(var(--tw-color-brand-orange) / <alpha-value>)',
        },
        polar: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc8fb",
          400: "#36a9f7",
          500: "#0c8de4",
          600: "#026fc2",
          700: "#0359a0",
          800: "#074c83",
          900: "#0c3f6e",
          950: "#072849",
        },
        navy: {
          800: "#0f2337",
          900: "#0b1928",
          950: "#07111c",
        },
        glacier: "#e8f4f8",
        ice: "#dbeafe",
        saffron: {
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
