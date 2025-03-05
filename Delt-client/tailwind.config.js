/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        dlt: {
          gld: '#deae42',
          DEFAULT: '#571B7E',
          wht: '#FFFFF6',
          light: '#DAB1DA'
        }
      }
    },
  },
  plugins: [],
}

