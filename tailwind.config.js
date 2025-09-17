/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#FDE2F3',
          DEFAULT: '#F8BBD9',
          dark: '#F472B6',
        },
        secondary: {
          light: '#DBEAFE',
          DEFAULT: '#BFDBFE',
          dark: '#93C5FD',
        },
        accent: {
          light: '#FFFBEB',
          DEFAULT: '#FEF3C7',
          dark: '#FCD34D',
        },
        surface: {
          DEFAULT: '#FEF7FF',
          dark: '#FCE7F3',
        },
        'text-color': {
          DEFAULT: '#64748B',
          dark: '#334155',
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
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
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
