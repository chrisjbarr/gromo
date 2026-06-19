/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Muted steel-blue accent used across the app.
        steel: {
          50: '#eef2f9',
          100: '#dde4f1',
          200: '#bcc9e1',
          300: '#94a8cd',
          400: '#6c84b3',
          500: '#4f6699',
          600: '#3f5a86',
          700: '#344a6e',
          800: '#2d3e5b',
          900: '#28354d',
        },
      },
    },
  },
  plugins: [],
};
