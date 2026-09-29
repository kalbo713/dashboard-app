import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-mesh":
          "radial-gradient(circle at 0% 0%, rgba(129, 140, 248, 0.24), transparent 55%), radial-gradient(circle at 100% 0%, rgba(147, 197, 253, 0.16), transparent 55%), radial-gradient(circle at 0% 100%, rgba(236, 72, 153, 0.12), transparent 55%), radial-gradient(circle at 100% 100%, rgba(56, 189, 248, 0.1), transparent 55%)",
      },
      animation: {
        "mesh-shift": "meshShift 30s ease-in-out infinite alternate",
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
      },
      keyframes: {
        meshShift: {
          "0%": {
            transform: "translate3d(0, 0, 0) scale(1)",
            filter: "hue-rotate(0deg)",
          },
          "50%": {
            transform: "translate3d(0, -10px, 0) scale(1.02)",
            filter: "hue-rotate(20deg)",
          },
          "100%": {
            transform: "translate3d(0, 5px, 0) scale(1.01)",
            filter: "hue-rotate(-15deg)",
          },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

