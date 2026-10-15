import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-itim)", "system-ui", "sans-serif"],
        gothic: ["var(--font-gothic)", "serif"],
      },
      keyframes: {
        splash: { "0%": { opacity: "0", transform: "scale(0.92)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        "tab-in": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        splash: "splash 0.7s ease-out both",
        "tab-in": "tab-in 300ms ease-out both",
      },
      colors: {
        canvas: "#8C7CB6",
        card: "#6B5A9E",
        deep: "#4B3D78",
        star: "#FFD60A",
        lime: "#B6F03C",
        soul: "#0D0D0D",
        blood: "#B3122B",
      },
    },
  },
  plugins: [],
} satisfies Config;