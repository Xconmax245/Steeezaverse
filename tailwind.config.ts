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
        black:        "#080808",
        white:        "#f5f5f5",
        "sz-red":     "#d42b2b",
        "sz-red-dim": "#a01f1f",
        "sz-blue":    "#1a6cf5",
        "sz-blue-dim":"#1250bb",
      },
      fontFamily: {
        sans:    ["Ranade", "sans-serif"],
        archivo: ["Archivo", "sans-serif"],
        aktura:  ["Aktura", "serif"],
      },
      letterSpacing: {
        tighter2: "-0.04em",
        wide2:    "0.18em",
        wider2:   "0.28em",
      },
      transitionTimingFunction: {
        "out-expo":  "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      animation: {
        "fade-up": "fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fadeIn 0.5s ease both",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
