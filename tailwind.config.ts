import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Forest library palette — warm, organic, atmospheric
        forest: {
          deepest: "#0c1410",
          deep: "#13201a",
          mid: "#1d3327",
          moss: "#2f4a36",
          fern: "#4a6b4f",
          sage: "#7c9b7e",
        },
        wood: {
          dark: "#2a1c12",
          shelf: "#3d2b1c",
          plank: "#5a3f28",
          warm: "#7a5638",
          light: "#a07a4f",
        },
        lantern: {
          glow: "#ffcf8a",
          warm: "#f5b860",
          amber: "#e08a3c",
          core: "#fff4dc",
        },
        parchment: {
          DEFAULT: "#ede3cf",
          dark: "#d8c9a8",
          ink: "#3a3026",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        spine: "inset -3px 0 6px rgba(0,0,0,0.45), inset 3px 0 4px rgba(255,255,255,0.06)",
        "spine-hover": "inset -3px 0 6px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.5)",
        lantern: "0 0 60px 20px rgba(255,207,138,0.35)",
        book: "0 30px 60px -15px rgba(0,0,0,0.7)",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "45%": { opacity: "0.92", filter: "brightness(1.05)" },
          "55%": { opacity: "0.97", filter: "brightness(0.96)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "50%": { transform: "translateY(-18px) translateX(8px)" },
        },
        "drift-slow": {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "10%": { opacity: "0.8" },
          "90%": { opacity: "0.8" },
          "100%": { transform: "translateY(-120px)", opacity: "0" },
        },
      },
      animation: {
        flicker: "flicker 4s ease-in-out infinite",
        float: "float 9s ease-in-out infinite",
        "drift-slow": "drift-slow 12s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
