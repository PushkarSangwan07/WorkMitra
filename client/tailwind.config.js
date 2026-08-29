/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary : {
          50:  '#fff4ef',
          100: '#ffe4d6',
          200: '#ffc4a8',
          300: '#ff9b70',
          400: '#f97240',
          500: '#e8673a',
          600: '#d4521f',
          700: '#b03d12',
          800: '#8f3010',
          900: '#752a10',
        },
        dark: {
          50:  '#f5f5f5',
          100: '#e0e0e0',
          700: '#1a1a1a',
          800: '#141414',
          900: '#0d0d0d',
          950: '#080808',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':  'fadeIn 0.4s ease-out both',
        'fade-up':  'fadeUp 0.5s ease-out both',
        'scale-in': 'scaleIn 0.3s ease-out both',
        'float':    'float 5s ease-in-out infinite',
        'shimmer':  'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp:   { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:  { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        float:    { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        shimmer:  { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        'card':     '0 1px 3px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(232,103,58,0.2)',
        'orange-glow': '0 0 20px rgba(232,103,58,0.35)',
      },
    },
  },
  plugins: [],
};