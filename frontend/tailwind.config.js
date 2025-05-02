/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          primary: '#1F2937',
          secondary: '#111827',
          accent: '#3B82F6',
          text: '#F3F4F6',
          'text-secondary': '#9CA3AF',
          'card': '#374151',
          'card-hover': '#4B5563'
        }
      },
      boxShadow: {
        'dark': '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}