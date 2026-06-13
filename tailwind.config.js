/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0c2340',
          800: '#0f2d4a',
          700: '#173a5e',
        },
        teal: {
          400: '#4dd9c0',
          500: '#2dc4aa',
          600: '#1aaa91',
        },
      },
    },
  },
  plugins: [],
}
