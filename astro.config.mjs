import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import vercelStatic from "@astrojs/vercel/static";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  experimental: {
    assets: true,
  },
  output: "server",
  adapter: vercelStatic({
    analytics: true,
    imagesConfig: {
      sizes: [320, 640, 1280, 2560],
    },
    imageService: true,
  }),
});
