module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6b2b89',
          light: '#8a3bad',
          dark: '#4c1d62'
        },
        secondary: {
          DEFAULT: '#f2709c',
          light: '#ff8eb3',
          dark: '#d45c82'
        }
      },
      animation: {
        'float': 'float 15s infinite ease-in-out',
        'pulse-slow': 'pulse 4s infinite ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(10deg)' },
        }
      }
    },
  },
  plugins: [],
} 