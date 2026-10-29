/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    "bg-violet-950",
    "bg-violet-900",
    "bg-purple-950",
  ],
  theme: {
    extend: {
      colors: {
        violet: {
          950: "#2e1065",
        },
      },
    },
  },
  plugins: [],
};
