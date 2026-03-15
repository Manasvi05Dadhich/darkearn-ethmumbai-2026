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
        darkbg: "#060606",
        neon: "#ccff00",
        cardBg: "#141414",
        borderGray: "#262626",
      }
    },
  },
  plugins: [],
}