import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [],
  theme: {
    extend: {
      animation: {
        "pulse-slow": "pulse-light 5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 1.8s linear infinite",
      },
      keyframes: {
        "pulse-light": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
};
export default config;
