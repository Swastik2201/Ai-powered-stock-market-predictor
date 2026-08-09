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
        background: "#0B0E14",
        surface: "#161B22",
        border: "#21262D",
        profit: "#00E676",
        loss: "#FF5252",
        aiAccent: "#8A2BE2",
        gold: "#FFD700",
      },
      fontFamily: {
        sans: ["Inter", "var(--font-inter)", "sans-serif"],
        mono: ["JetBrains Mono", "var(--font-mono)", "monospace"],
      },
      animation: {
        "pulse-glow": "pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "border-glow": "borderGlow 3s ease-in-out infinite alternate",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        borderGlow: {
          "0%": { borderColor: "#8A2BE2", boxShadow: "0 0 10px rgba(138, 43, 226, 0.3)" },
          "100%": { borderColor: "#00E676", boxShadow: "0 0 20px rgba(0, 230, 118, 0.4)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
