// @ts-check
import vercel from "@astrojs/vercel";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://www.jhuang.dev",
  adapter: vercel(),
  integrations: [
    preact(),
    sitemap({
      filter: (page) =>
        !/\/(api|open-graph)\/|\/resume\.pdf$|\/404\/?$/.test(new URL(page).pathname),
    }),
  ],
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
