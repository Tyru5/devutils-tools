/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        neutral: {
          950: "#0a0a0a",
        },
      },
      fontFamily: {
        sans: [
          "Geist",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "Geist Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      borderColor: {
        DEFAULT: "rgb(229 229 229)", // neutral-200
        dark: "rgb(38 38 38)", // neutral-800
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
