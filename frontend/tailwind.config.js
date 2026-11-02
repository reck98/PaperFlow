/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      colors: {
        paper: {
          50: '#faf9f6',
          100: '#f5f3ef',
          200: '#ebe7e0',
          300: '#ded8ce',
          400: '#bfb5a3',
          500: '#8c7e68',
          600: '#6b5e4c',
          700: '#4e4335',
          800: '#342c22',
          900: '#1e1913',
        },
        ink: {
          light: '#1f2421',
          DEFAULT: '#111413',
          dark: '#ededed',
          muted: '#666a68',
          dim: '#9ca19e',
        },
      },
      boxShadow: {
        'page': '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'page-dark': '0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
