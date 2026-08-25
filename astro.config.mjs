// @ts-check
import vercel from "@astrojs/vercel";
import preact from "@astrojs/preact";
import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://jhuang.dev",
  adapter: vercel({
    webAnalytics: {
      enabled: true, // set to false when using @vercel/analytics@1.4.0
    },
  }),
  integrations: [preact()],
  markdown: {
    syntaxHighlight: false,
  },
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "base-uri 'self'",
        "connect-src 'self'",
        "font-src 'self'",
        "form-action 'self'",
        "frame-src 'none'",
        "img-src 'self' https://lastfm-img.freetls.fastly.net",
        "media-src 'none'",
        "object-src 'none'",
        "worker-src 'none'",
        "upgrade-insecure-requests",
      ],
    },
  },
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
});
