import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import Critters from "astro-critters";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react(), Critters()],
});
