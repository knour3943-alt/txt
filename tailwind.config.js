/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E6C757',
          dark: '#B8941F',
        },
        cream: '#F8F9FA',
        charcoal: '#121212',
      },
      fontFamily: {
        ruqaa: ['"Aref Ruqaa"', 'serif'],
        cairo: ['Cairo', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 4px 20px rgba(212, 175, 55, 0.35)',
      },
    },
  },
  plugins: [],
}
