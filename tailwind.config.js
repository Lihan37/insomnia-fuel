/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#F5EEDF", // page background (beige)
        surface: "#FAF6EF", // cards/sections
        border: "#E8E1D8",
        text: { DEFAULT: "#1E1E1E", subtle: "#5C5C5C" },
        accent: "#FF004C",
        hover: "#FFD8D2",
      },
    },
  },
  plugins: [],
};
