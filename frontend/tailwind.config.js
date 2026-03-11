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
          dark: "#0f172a",
          primary: "#1e293b",
          accent: "#2563eb",
          light: "#f1f5f9",
        },
      },
    },
  },
  plugins: [],
}
