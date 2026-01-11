module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0D9488',
        teal: {
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          900: '#064E3B'
        },
        accent: '#2DD4BF',
        background: '#02131a',
        surface: '#022f2c'
      }
    }
  },
  plugins: [],
}
