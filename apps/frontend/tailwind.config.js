/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          800: '#1e2b45',
          900: '#172033',
          950: '#0f172a'
        },
        brand: {
          blue: '#2563eb',
          hover: '#1d4ed8',
          bg: '#f4f7fb'
        }
      }
    }
  },
  plugins: []
};
