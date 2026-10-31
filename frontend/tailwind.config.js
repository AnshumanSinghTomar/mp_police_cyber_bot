/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark:    "#020617",
          primary: "#0f172a",
          card:    "#1e293b",
          accent:  "#22d3ee",
          light:   "#f1f5f9",
        },
      },
    },
  },
  plugins: [],
}


