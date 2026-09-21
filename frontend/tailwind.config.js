/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#050B18",
          900: "#0A1226",
          850: "#0D1730",
          800: "#101D3D",
          700: "#16274F",
          600: "#1E3564"
        },
        accent: {
          teal: "#2DD4BF",
          cyan: "#38BDF8",
          green: "#34D399",
          red: "#F87171",
          amber: "#FBBF24"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"]
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.04), 0 8px 24px -8px rgba(0,0,0,0.5)"
      }
    }
  },
  plugins: []
};
