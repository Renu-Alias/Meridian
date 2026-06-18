import { defineConfig } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

export default defineConfig({
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        surface: '#EAECEC',
        muted: '#999B9B',
        verified: '#00C896',
        flagged: '#FF6B6B',
        highlight: '#FFB900',
      },
    },
    fontFamily: {
      sans: ['Inter', ...defaultTheme.fontFamily.sans],
    },
  },
  plugins: [],
});
