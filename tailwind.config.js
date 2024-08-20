/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "app/page.js",
    "app/generate/page.js",
    "app/flashcards/page.js",
    "app/flashcard/page.js",
    "app/sign-in/[[...sign-in]]/page.js",
    "app/sign-up/[[...sign-up]]/page.js"
    


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