/** @type {import('tailwindcss').Config} */
const lime = {
  50: '#fbfde8', 100: '#f4f9c0', 200: '#ecf58f', 300: '#e6f376',
  400: '#dff25a', 500: '#d4e84a', 600: '#c5da3a', 700: '#9fb02c',
  800: '#6f7a22', 900: '#434a1a', 950: '#262a10',
};

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Re-skin: every existing sky/cyan accent becomes the lime accent
        sky: lime,
        cyan: lime,
        // Neutral, slightly warm near-black greys + cream text
        slate: {
          50: '#f5f1e6', 100: '#efebe0', 200: '#d9d6cc', 300: '#b8b6ae',
          400: '#8d8c87', 500: '#6b6b69', 600: '#4a4a4c', 700: '#2e2f33',
          800: '#202125', 850: '#1a1b1f', 900: '#141518', 950: '#0a0a0c',
        },
        purple: {
          50: '#f3f0ff', 100: '#e5dfff', 200: '#cfc4ff', 300: '#b3a0f7',
          400: '#8a6af0', 500: '#5a2ee0', 600: '#4b22c8', 700: '#3d1ba3',
          800: '#2d1478', 900: '#1e0e50', 950: '#120833',
        },
        lab: {
          950: '#0a0a0c', 900: '#111114', 850: '#16171b', 800: '#1c1d22',
          700: '#25262b', 600: '#34353b',
          accent: '#dff25a', glow: '#c5da3a', cream: '#f5f1e6',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['"Inter Tight"', 'Inter', 'sans-serif'],
        display: ['"Inter Tight"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
