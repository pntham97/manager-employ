/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // 👈 bật class-based dark mode
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "surface-light": "#f8fafc", // ví dụ
        "surface-dark": "#0f172a",
      },
    },
  },
  plugins: [],
};
