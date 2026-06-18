/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#000000",
        surface: "#EAECEC",
        muted: "#999B9B",
        "accent-blue": "#2563EB",
        "accent-amber": "#D97706",
        "accent-teal": "#0D9488",
        "accent-coral": "#E11D48",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        pill: '9999px',
      }
    },
  },
  plugins: [],
}
