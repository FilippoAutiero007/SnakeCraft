/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['Press Start 2P', 'cursive'],
        sans: ['Roboto', 'sans-serif'],
      },
      colors: {
        dark: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      }
    },
  },
  plugins: [],
  safelist: [
    'flex',
    'flex-col',
    'items-center',
    'justify-center',
    'w-full',
    'h-full',
    'text-white',
    'bg-dark-900',
  ]
}
