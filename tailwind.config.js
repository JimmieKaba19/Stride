/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Stride brand — earthy green (growth, discipline)
        brand: {
          50:  '#EAF3DE',
          100: '#D0E8B8',
          200: '#B0D98C',
          300: '#97C459',
          400: '#7DAF35',
          500: '#639922',
          600: '#3B6D11',
          700: '#27500A',
          800: '#1A3A05',
          900: '#0F2402',
        },
        surface: {
          0:   '#ffffff',
          50:  '#f8faf6',
          100: '#f1f5ed',
          200: '#e4edda',
          300: '#cddfc0',
          400: '#a8c490',
          500: '#7da86a',
          600: '#5a8a4a',
          700: '#3d6b30',
          800: '#1e2a18',
          900: '#111a0b',
          950: '#080f04',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'flame': 'flame 0.6s ease-in-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        flame: {
          '0%,100%': { transform: 'scale(1)' },
          '50%':     { transform: 'scale(1.3) rotate(-5deg)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
