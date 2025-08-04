/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#341B58',
          light: '#4A1E69',
          dark: '#2A1045',
        },
        secondary: {
          DEFAULT: '#DF678C',
          light: '#E57896',
          dark: '#D4567A',
        },
        accent: {
          pink: '#FFD6DD',
          purple: '#E15E89',
          light: '#F8E1EC',
        },
        background: {
          DEFAULT: '#FDFBFF',
          card: '#FFFFFF',
          section: '#F9F8FA',
        }
      },
    },
  },
  plugins: [],
}
