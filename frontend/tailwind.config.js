/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#22222B',
          lighter: '#2A2A35',
          card: '#323241',
        },
        pastel: {
          green: '#8CBC88',
          yellow: '#FCD37F',
          pink: '#F0C3D2',
          purple: '#7767D6',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B8B8C0',
        },
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'card-hover': 'cardHover 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        cardHover: {
          '0%': { transform: 'translateY(0) scale(1)' },
          '100%': { transform: 'translateY(-8px) scale(1.02)' },
        },
      },
      boxShadow: {
        '3d': '0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        '3d-hover': '0 20px 40px -5px rgba(0, 0, 0, 0.6), 0 8px 12px -2px rgba(0, 0, 0, 0.4)',
        'glow-green': '0 0 20px rgba(140, 188, 136, 0.5)',
        'glow-yellow': '0 0 20px rgba(252, 211, 127, 0.5)',
        'glow-pink': '0 0 20px rgba(240, 195, 210, 0.5)',
        'glow-purple': '0 0 20px rgba(119, 103, 214, 0.5)',
      },
    },
  },
  plugins: [],
}
