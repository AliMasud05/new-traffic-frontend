import animatePlugin from 'tailwindcss-animate';

export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'noto-serif-georgian': ['Noto Serif Georgian', 'serif'],
      },
      screens: {
        'xl-custom': '1200px',
      }
    },
  },
  plugins: [animatePlugin],
};