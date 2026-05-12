import type { Config } from "tailwindcss";

function withOpacity(variable: string) {
  return `rgb(var(${variable}) / <alpha-value>)`;
}

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: withOpacity("--color-primary-50"),
          100: withOpacity("--color-primary-100"),
          200: withOpacity("--color-primary-200"),
          300: withOpacity("--color-primary-300"),
          400: withOpacity("--color-primary-400"),
          500: withOpacity("--color-primary-500"),
          600: withOpacity("--color-primary-600"),
          700: withOpacity("--color-primary-700"),
          800: withOpacity("--color-primary-800"),
          900: withOpacity("--color-primary-900"),
        },
        success: {
          50: withOpacity("--color-success-50"),
          100: withOpacity("--color-success-100"),
          500: withOpacity("--color-success-500"),
          600: withOpacity("--color-success-600"),
          700: withOpacity("--color-success-700"),
          900: withOpacity("--color-success-900"),
        },
        danger: {
          50: withOpacity("--color-danger-50"),
          100: withOpacity("--color-danger-100"),
          500: withOpacity("--color-danger-500"),
          600: withOpacity("--color-danger-600"),
          700: withOpacity("--color-danger-700"),
        },
        warning: {
          50: withOpacity("--color-warning-50"),
          100: withOpacity("--color-warning-100"),
          500: withOpacity("--color-warning-500"),
          600: withOpacity("--color-warning-600"),
          700: withOpacity("--color-warning-700"),
        },
        neutral: {
          50: withOpacity("--color-neutral-50"),
          100: withOpacity("--color-neutral-100"),
          200: withOpacity("--color-neutral-200"),
          300: withOpacity("--color-neutral-300"),
          400: withOpacity("--color-neutral-400"),
          500: withOpacity("--color-neutral-500"),
          600: withOpacity("--color-neutral-600"),
          700: withOpacity("--color-neutral-700"),
          800: withOpacity("--color-neutral-800"),
          900: withOpacity("--color-neutral-900"),
        },
        sidebar: {
          bg: withOpacity("--color-sidebar-bg"),
          text: withOpacity("--color-sidebar-text"),
          active: withOpacity("--color-sidebar-active"),
        },
        surface: withOpacity("--color-surface"),
        "page-bg": withOpacity("--color-page-bg"),
        border: withOpacity("--color-border"),
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
