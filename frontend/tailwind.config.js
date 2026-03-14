/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@fileverse-dev/ddoc/dist/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        neon: "#eaff00",
        darkbg: "#060606"
      }
    },
  },
  plugins: [],
}