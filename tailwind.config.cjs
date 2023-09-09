/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse-light 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-light': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .8 }
        }
      }
    },
  },
  plugins: [],
};
