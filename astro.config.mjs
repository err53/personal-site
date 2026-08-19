// @ts-check
import vercel from "@astrojs/vercel";
import preact from "@astrojs/preact";
import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  adapter: vercel({
    webAnalytics: {
      enabled: true, // set to false when using @vercel/analytics@1.4.0
    },
  }),
  integrations: [preact()],
  build: {
    // Re-evaluate this if we add more pages, since repeated inline CSS cannot be cached separately.
    inlineStylesheets: "always",
  },
  env: {
    schema: {
      LASTFM_API_KEY: envField.string({ context: "server", access: "secret" }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    layout: "constrained",
  },
});
