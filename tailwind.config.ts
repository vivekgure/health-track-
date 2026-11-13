import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        spider: {
          bg: "#080808",
          dark: "#101010",
          card: "#151515",
          border: "#292929",
          borderHover: "#4A1116",
          red: "#B5121B",
          neon: "#FF2638",
          crimson: "#8B0E15",
          blood: "#5C080D",
          text: "#F5F5F5",
          muted: "#999999",
          dim: "#666666",
        },
        card: {
          DEFAULT: "var(--card-bg)",
          border: "var(--card-border)",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "web-pulse": "webPulse 5s ease-in-out infinite alternate",
        "web-glow": "webGlow 2.5s ease-in-out infinite alternate",
        "web-spin-slow": "spin 25s linear infinite",
        "ember-float": "emberFloat 4s ease-in-out infinite",
        "fade-in": "fadeIn 0.4s ease-out forwards",
      },
      keyframes: {
        webPulse: {
          "0%": { opacity: "0.25", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(1.02)" },
          "100%": { opacity: "0.25", transform: "scale(1)" },
        },
        webGlow: {
          "0%": {
            boxShadow: "0 0 10px rgba(181, 18, 27, 0.2), inset 0 0 10px rgba(181, 18, 27, 0.1)",
          },
          "100%": {
            boxShadow: "0 0 25px rgba(255, 38, 56, 0.5), inset 0 0 15px rgba(255, 38, 56, 0.2)",
          },
        },
        emberFloat: {
          "0%, 100%": { transform: "translateY(0px) scale(0.9)", opacity: "0.4" },
          "50%": { transform: "translateY(-12px) scale(1.1)", opacity: "0.85" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
