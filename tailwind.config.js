/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#F9D4C4',
          DEFAULT: '#F4A27E',
          dark: '#E67C53',
        },
        secondary: {
          light: '#D4E9E2',
          DEFAULT: '#A8D8C7',
          dark: '#7EC1AC',
        },
        accent: {
          light: '#EADBC8',
          DEFAULT: '#D1BFA8',
          dark: '#B8A388',
        },
        surface: {
          DEFAULT: '#FDFBF8',
          dark: '#F5EFE6',
        },
        'text-color': {
          DEFAULT: '#6B7280', // Lighter gray (gray-500)
          dark: '#374151',    // Lighter dark gray (gray-700)
        },
        status: {
          success: '#10B981',
          'success-light': '#D1FAE5',
          warning: '#F59E0B',
          'warning-light': '#FEF3C7',
          danger: '#EF4444',
          'danger-light': '#FEE2E2',
          info: '#3B82F6',
          'info-light': '#DBEAFE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      animation: {
        'bounce-soft': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};
