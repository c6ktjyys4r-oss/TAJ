/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#FBF7EE',
          100: '#F5EDD6',
          200: '#ECD9A8',
          300: '#E0C27A',
          400: '#D4AB52',
          500: '#C9A84C',
          600: '#B8962E',
          700: '#9A7C22',
          800: '#7A611A',
          900: '#5C4912',
        },
        surface: '#F9FAFB',
        border: '#E5E7EB',
        ink: {
          primary:   '#1A1A1A',
          secondary: '#6B7280',
          muted:     '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)',
        float: '0 8px 32px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        xl2: '1rem',
      },
    },
  },
  plugins: [],
};
