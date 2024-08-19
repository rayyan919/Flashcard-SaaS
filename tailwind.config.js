/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "app/page.js",
    "app/generate/page.js",
    "app/flashcards/page.js",
    "app/flashcard/page.js"
    
    // "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    // "./components/**/*.{js,ts,jsx,tsx,mdx}",

  ],
  theme: {
    extend: {
      colors: {
        primary: '#210124',
        secondary: '#750D37',
        accent: '#B3DEC1',
        light: '#DBF9F0',
        background: '#F7F9F7',
      },
    },
  },
  plugins: [],
}