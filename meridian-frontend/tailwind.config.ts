import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#000000',
        surface: '#EAECEC',
        muted: '#999B9B',
        verified: '#00C896',
        flagged: '#FF6B6B',
        highlight: '#FFB900',
      },
      fontFamily: {
        sans: ['Lato', '"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'monospace'],
      },
      boxShadow: {
        panel: '0 18px 50px rgba(0, 0, 0, 0.08)',
        glow: '0 0 32px rgba(0, 200, 150, 0.28)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(0, 200, 150, 0)' },
          '50%': { boxShadow: '0 0 28px rgba(0, 200, 150, 0.35)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        ripple: {
          '0%': { transform: 'scale(0.72)', opacity: '0.55' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 2.4s ease-in-out infinite',
        fadeUp: 'fadeUp 700ms ease-out both',
        ripple: 'ripple 3s ease-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
