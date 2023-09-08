import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react()],
  output: "server",
  adapter: vercel({
    analytics: true,
    imageService: true,
    imagesConfig: {
      sizes: [398, 796, 1360],
    },
  }),
  vite: {
    define: {
      "import.meta.env.VITE_VERCEL_ANALYTICS_ID": JSON.stringify(process.env.VERCEL_ANALYTICS_ID),
      "import.meta.env.PUBLIC_VERCEL_ANALYTICS_ID": JSON.stringify(process.env.VERCEL_ANALYTICS_ID),
    },
  }
});