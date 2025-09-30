/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Professional Dark Theme Colors
        'dark': {
          900: '#0a0a0a',
          800: '#141414', 
          700: '#1e1e1e',
          600: '#2d2d2d',
          500: '#404040',
          400: '#525252',
          300: '#6b6b6b',
          200: '#8a8a8a',
          100: '#a3a3a3',
        },
        // Professional Neon Accents
        'neon': {
          blue: '#00d4ff',
          purple: '#8b5cf6',
          green: '#10b981',
          cyan: '#06b6d4',
          pink: '#ec4899',
          yellow: '#f59e0b',
        },
        // UI State Colors
        'success': '#10b981',
        'warning': '#f59e0b', 
        'error': '#ef4444',
        'info': '#06b6d4',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'SF Mono', 'Monaco', 'monospace'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { 
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
          },
          '100%': { 
            boxShadow: '0 0 30px rgba(0, 212, 255, 0.6)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0a0a0a 0%, #141414 100%)',
        'gradient-neon': 'linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(20, 20, 20, 0.8) 0%, rgba(45, 45, 45, 0.8) 100%)',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 212, 255, 0.3)',
        'neon-strong': '0 0 30px rgba(0, 212, 255, 0.6)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.7)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}