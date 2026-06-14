/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'space': {
          900: '#0A1628',
          800: '#0F1F38',
          700: '#152A47',
          600: '#1C3556',
          500: '#244266',
        },
        'tech': {
          50: '#E6F9FF',
          100: '#B8F0FF',
          200: '#6AE6FF',
          300: '#33DFFF',
          400: '#1AD9FF',
          500: '#00D4FF',
          600: '#00A8CC',
          700: '#007C99',
          800: '#005566',
        },
        'alert': {
          critical: '#FF4D4F',
          warning: '#FF8A3D',
          notice: '#FFC53D',
          info: '#8B7BFF',
        },
        'data': {
          good: '#00E68A',
          warn: '#FFC53D',
          bad: '#FF4D4F',
        }
      },
      fontFamily: {
        sans: ['"HarmonyOS Sans"', '"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"D-DIN"', 'Consolas', 'monospace'],
        display: ['"Orbitron"', '"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-blue': '0 0 16px rgba(0, 212, 255, 0.45)',
        'glow-blue-sm': '0 0 8px rgba(0, 212, 255, 0.35)',
        'glow-red': '0 0 16px rgba(255, 77, 79, 0.5)',
        'glow-orange': '0 0 16px rgba(255, 138, 61, 0.45)',
        'glow-green': '0 0 16px rgba(0, 230, 138, 0.4)',
        'glow-purple': '0 0 16px rgba(139, 123, 255, 0.45)',
        'card': '0 4px 24px rgba(0, 212, 255, 0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
        'card-hover': '0 8px 32px rgba(0, 212, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-from), var(--tw-gradient-to) 70%)',
        'grid-pattern': "linear-gradient(rgba(0, 212, 255, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid-40': '40px 40px',
        'grid-20': '20px 20px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'scan': 'scan 4s linear infinite',
        'flow': 'flow 6s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'slide-right': 'slide-right 0.4s ease-out',
        'shine': 'shine 3s ease-in-out infinite',
        'count-up': 'count-up 1.5s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0, 212, 255, 0.4)' },
          '50%': { boxShadow: '0 0 24px rgba(0, 212, 255, 0.8)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
        'flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-right': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'shine': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'count-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
    },
  },
  plugins: [],
};
