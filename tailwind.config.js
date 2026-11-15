/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vedic: {
          saffron: "#f97316",
          gold: "#eab308",
          amber: "#f59e0b",
          crimson: "#dc2626",
          dark: "#0b0b0e",
          card: "#121218",
          border: "#262633",
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        outfit: ['var(--font-outfit)', 'Outfit', 'system-ui', 'sans-serif'],
        serif: ['var(--font-devanagari)', 'Noto Serif Devanagari', 'Georgia', 'serif'],
        devanagari: ['var(--font-devanagari)', 'Noto Serif Devanagari', 'Georgia', 'serif'],
        mono: ['var(--font-space-grotesk)', 'Space Grotesk', 'monospace'],
        grotesk: ['var(--font-space-grotesk)', 'Space Grotesk', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 30s linear infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
};
