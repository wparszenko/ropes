/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        neon: {
          green: '#18FF92',
          blue: '#00E0FF',
          red: '#FF5050',
          purple: '#B347FF',
          yellow: '#FFE347',
          pink: '#FF47B3',
        },
        dark: {
          bg: '#0F1117',
          surface: '#1A1D29',
          border: '#2D3748',
        }
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite alternate',
        'glow': 'glow 1.5s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%': { opacity: '0.7' },
          '100%': { opacity: '1' },
        },
        'glow': {
          '0%': { 
            shadowColor: '#18FF92',
            shadowOpacity: '0.5',
            shadowRadius: '10',
          },
          '100%': { 
            shadowColor: '#18FF92',
            shadowOpacity: '0.8',
            shadowRadius: '20',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}