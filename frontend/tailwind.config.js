/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      width: {
        '96': '24rem',
        '128': '32rem',
        'almost-full': 'calc(100vw - 2rem)',
        'screen-80': '80vw',
        'screen-70': '70vw'
      },
      height: {
        'almost-full': 'calc(100vh - 2rem)',
        'screen-80': '80vh',
        'screen-70': '70vh'
      },
      minHeight: {
        'almost-full': 'calc(100vh - 2rem)',
        'screen-80': '80vh',
        'screen-70': '70vh',
        'screen-60': '60vh'
      },
    }
  },
  daisyui: {
    themes: ['corporate'], // only one theme
  },
  // plugins: [
    // require('daisyui'),
  // ],
}