/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef4ff',
          100: '#d9e3ff',
          500: '#3858d6',
          600: '#2f4cba',
          700: '#27409a',
          900: '#15235a',
        },
      },
    },
  },
  plugins: [],
};
