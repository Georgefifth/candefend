/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        carbon: {
          950: '#070a0e',
          900: '#0b0f14',
          800: '#121a24',
          700: '#1a2636',
          600: '#233246',
          500: '#324762',
        },
        telemetry: {
          cyan: '#06b6d4',
          amber: '#f59e0b',
          red: '#ef4444',
          green: '#10b981',
          blue: '#3b82f6',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
