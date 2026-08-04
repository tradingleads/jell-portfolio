import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["var(--font-outfit)", "sans-serif"],
      },
      colors: {
        background: "var(--sc-background)",
        foreground: "var(--sc-foreground)",
        card: {
          DEFAULT: "var(--sc-card)",
          foreground: "var(--sc-card-foreground)",
        },
        primary: {
          DEFAULT: "var(--sc-primary)",
          foreground: "var(--sc-primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--sc-secondary)",
          foreground: "var(--sc-secondary-foreground)",
        },
        accent: {
          DEFAULT: "var(--sc-accent)",
          foreground: "var(--sc-accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--sc-destructive)",
          foreground: "var(--sc-destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--sc-secondary)",
          foreground: "var(--sc-muted-foreground)",
        },
        border: "var(--sc-border)",
        input: "var(--sc-input)",
        ring: "var(--sc-ring)",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out forwards",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
