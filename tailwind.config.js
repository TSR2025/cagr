/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",
        foreground: "#0F172A",
        primary: {
          DEFAULT: "#3BA7B8",
          foreground: "#EFF6FF",
          dark: "#2E8CA0"
        },
        muted: {
          DEFAULT: "#E2E8F0",
          foreground: "#475569"
        },
        border: "#CBD5E1"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"]
      },
      boxShadow: {
        subtle: "0 10px 30px -24px rgba(15, 23, 42, 0.25)"
      }
    }
  },
  plugins: []
};
