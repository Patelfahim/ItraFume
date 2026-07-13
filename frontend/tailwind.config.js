/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#fcf9f8',
        'surface-dim': '#dcd9d9',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f6f3f2',
        'surface-container': '#f0eded',
        'surface-container-high': '#eae7e7',
        'surface-container-highest': '#e5e2e1',
        'on-surface': '#1b1b1c',
        'on-surface-variant': '#44474d',
        'inverse-surface': '#303030',
        outline: '#75777e',
        'outline-variant': '#c5c6ce',
        primary: '#00030a',
        'on-primary': '#ffffff',
        'primary-container': '#0a1d37',
        secondary: '#775a19',
        'on-secondary': '#ffffff',
        'secondary-container': '#fed488',
        'on-secondary-container': '#785a1a',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        container: '1440px',
      },
    },
  },
  plugins: [],
};
