import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */

export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  preflight: false,
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
      backgroundColor: {
        'abra-primary': '#9d38c8',
        'abra-secondary': '#e0a88f',
        'abra-accent': '#d3c75f',
        'abra-neutral': '#07030a',
        'abra-base-100': '#f8f2fb',
      },
      textColor: {
        'abra-primary': '#9d38c8',
        'abra-secondary': '#e0a88f',
        'abra-accent': '#d3c75f',
        'abra-neutral': '#07030a',
        'abra-base-100': '#f8f2fb',
      },
      borderColor: {
        'abra-primary': '#9d38c8',
        'abra-secondary': '#e0a88f',
        'abra-accent': '#d3c75f',
        'abra-neutral': '#07030a',
        'abra-base-100': '#f8f2fb',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'serif': ['Merriweather', 'serif'],
      },
    }
  },
  daisyui: {
    themes: [
      // {
      //   abra: {
      //     "primary": "#9d38c8",
      //     "secondary": "#e0a88f",
      //     "accent": "#d3c75f",
      //     "neutral": "#07030a",
      //     "base-100": "#f8f2fb",
      //   },
      // },
    ], // only one theme
  },
  plugins: [
    // require('daisyui'),
    daisyui,
  ],
}