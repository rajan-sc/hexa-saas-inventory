import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Smart Care Design System Palette
        "forest-ink": "#0f3e17",
        "sage-wash": "#b1dbb8",
        "mist-blue": "#b6ced5",
        "mint-veil": "#cfe7d3",
        "linen": "#e1f4df",
        "linen-white": "#fffefc",
        "hairline-gray": "#e5e7eb",
        "charcoal": "#222222",
        "graphite": "#333333",
        "true-black": "#000000",

        // Status Colors
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          700: "#15803d",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          700: "#b45309",
        },
        danger: {
          50: "#fff1f2",
          100: "#ffe4e6",
          500: "#f43f5e",
          700: "#be123c",
        },
      },
      borderRadius: {
        nav: "7px",
        cards: "14px",
        badges: "999px",
        buttons: "14px",
      },
      fontFamily: {
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
