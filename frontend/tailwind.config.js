/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: '#ffffff',
        surface: '#f8f9ff',
        'surface-low': '#eff4ff',
        'surface-mid': '#e5eeff',
        'surface-high': '#dce9ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eff4ff',
        'surface-container': '#e5eeff',
        'surface-container-high': '#dce9ff',
        paper: '#ffffff',
        ink: '#0b1c30',
        'on-surface': '#0b1c30',
        'on-surface-variant': '#454652',
        muted: '#515f74',
        secondary: '#515f74',
        'secondary-container': '#d5e3fc',
        'on-secondary-container': '#57657a',
        primary: '#2d409f',
        'primary-soft': '#dee0ff',
        'primary-deep': '#00105a',
        'primary-fixed-dim': '#bac3ff',
        sage: '#354f41',
        'sage-soft': '#ccead7',
        danger: '#ba1a1a',
        'danger-soft': '#ffdad6',
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'Pretendard', 'sans-serif'],
        manrope: ['Manrope', 'Pretendard', 'sans-serif'],
        pretendard: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
