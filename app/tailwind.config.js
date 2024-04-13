/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    container: {
      center: true,
    },
    extend: {
      textShadow: {
        sm: '0 1px 2px var(--tw-shadow-color)',
        DEFAULT: '0 2px 4px var(--tw-shadow-color)',
        lg: '0 8px 16px var(--tw-shadow-color)',
      },
    },
    borderRadius: {
      'lg': '4rem',
    },
    fontFamily: {
      'sans': ['Raleway', 'Helvetica', 'Arial', 'sans-serif'],
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require("daisyui"),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') }
      )
    }),
  ],
  daisyui: {
    themes: [
      {
        dingit: {
          "primary": "#192A73",
          "secondary": "#069BB4",
          "secondary-content": "#FAFAFA",
          "accent": "#2640B5",
          "neutral": "#0C0A29",
          // "neutral": "#e5e7eb",
          "base-100": "#f3f4f6",
          "info": "#2563eb",
          "success": "#22c55e",
          "warning": "#eab308",
          "error": "#b91c1c",
          "--rounded-btn": "0.8rem",
          "--tab-border": "2px",
          "--tab-radius": "0.7rem",
        },
      },
    ],
  },
}

