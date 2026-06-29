import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        success: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
        },
        error: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
        },
        warning: {
          50: "#FFFBEB",
          500: "#F59E0B",
          600: "#D97706",
        },
        sheet: {
          border: "#E2E8F0",
          "header-bg": "#F1F5F9",
          "selected-border": "#2563EB",
          "selected-bg": "#EFF6FF",
          "row-hover": "#F8FAFC",
          "row-alt": "#F8FAFC",
          debit: "#DC2626",
          credit: "#16A34A",
          "row-number-bg": "#F8FAFC",
          "col-letter-bg": "#F1F5F9",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-in-up": "fadeInUp 0.5s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "check-in": "checkIn 0.4s ease-out",
        "progress-fill": "progressFill 3s ease-in-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "slide-up-sheet": "slideUpSheet 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        checkIn: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        progressFill: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        slideUpSheet: {
          "0%": { opacity: "0", transform: "translateY(100%)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        "sheet-cell": "0 0 0 2px #2563EB",
        "premium": "0 20px 60px rgba(0, 0, 0, 0.12)",
        "premium-hover": "0 30px 80px rgba(0, 0, 0, 0.16)",
        "glow-blue": "0 0 40px rgba(37, 99, 235, 0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
