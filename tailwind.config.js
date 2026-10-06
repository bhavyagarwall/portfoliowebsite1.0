/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          blue: '#18417e',
          dark: '#0f2c59',
          light: '#2b5ca5',
          muted: '#4a5d73',
          red: '#d93829',
          soft: 'rgba(24, 65, 126, 0.08)',
          subtle: 'rgba(24, 65, 126, 0.15)',
        },
        paper: '#f8f9fa',
        card: {
          yellow: '#fffde8',
          blue: '#f2f7fc',
        },
        washi: 'rgba(123, 161, 203, 0.85)',
      },
      fontFamily: {
        typewriter: ['"Special Elite"', 'Courier New', 'monospace'],
        mono: ['"Courier Prime"', 'Courier New', 'monospace'],
        handwritten: ['"Caveat"', 'cursive', 'sans-serif'],
      },
      boxShadow: {
        'polaroid': '0 8px 24px rgba(30, 50, 80, 0.12), 0 2px 6px rgba(30, 50, 80, 0.08)',
        'btn-ink': '2px 3px 0px rgba(15, 44, 89, 0.35)',
        'btn-ink-hover': '3px 4px 0px rgba(15, 44, 89, 0.45)',
        'card-soft': '0 6px 18px rgba(30, 50, 80, 0.08)',
      }
    },
  },
  plugins: [],
}

