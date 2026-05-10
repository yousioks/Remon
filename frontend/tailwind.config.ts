import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        remon: {
          red: '#ff0015',
          darkred: '#cc0011',
          black: '#0a0a0a',
          darkgray: '#1a1a1a',
          gray: '#f5f5f5',
          lightgray: '#fafafa',
          gold: '#d4af37',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
