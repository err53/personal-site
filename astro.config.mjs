// @ts-check
import vercel from '@astrojs/vercel';
import { defineConfig, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
    adapter: vercel(),
    env: {
        schema: {
            LASTFM_API_KEY: envField.string({ context: "server", access: "secret" })
        }
    },
    vite: {
        plugins: [tailwindcss()]
    },
    image: {
        layout: "constrained"
    }
});
