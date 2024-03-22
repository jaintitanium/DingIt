/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    container: {
      center: true,
    },
    extend: {},
    borderRadius: {
      'lg': '1rem',
    },
    fontFamily: {
      'sans': ['Raleway', 'Helvetica', 'Arial', 'sans-serif'],
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require("daisyui"),
  ],
  daisyui: {
    themes: [
      {
        dingit: {
          "primary": "#192A73",
          "secondary": "#069BB4",
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

