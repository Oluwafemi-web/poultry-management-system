import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        as: {
          ink: "var(--as-ink)",
          forest: "var(--as-forest)",
          moss: "var(--as-moss)",
          leaf: "var(--as-leaf)",
          mint: "var(--as-mint)",
          gold: "var(--as-gold)",
          mist: "var(--as-mist)",
          paper: "var(--as-paper)",
          line: "var(--as-line)",
        },
      },
      fontFamily: {
        display: ["var(--font-as-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-as-body)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
