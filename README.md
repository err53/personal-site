# jhuang.dev

Source for Jason Huang's personal site, served at <https://www.jhuang.dev>.

## Stack

- [Astro](https://astro.build) 7, with [Preact](https://preactjs.com) islands for interactive parts
- [Tailwind CSS](https://tailwindcss.com) 4 via `@tailwindcss/vite`
- [nanostores](https://github.com/nanostores/nanostores) and `@nanostores/query` for client-side data fetching
- Deployed on [Vercel](https://vercel.com) with the `@astrojs/vercel` adapter
- Node 24 (`.nvmrc` and `engines` in `package.json`)

## Setup

```sh
npm install
cp .env.example .env
```

Then set `LASTFM_API_KEY` in `.env`. It is declared in `astro.config.mjs` under `env.schema` as a server-only secret, so it never reaches the client.

To get a key, create an API account at <https://www.last.fm/api/account/create>. The key is used by the server routes that back the Last.fm card:

- `/api/lastfm.json`: the latest or currently playing track
- `/api/lastfm/recent.json`: recently played tracks

On Vercel, set the same variable in the project's environment variables.

## Development

Start the dev server in the background:

```sh
astro dev --background
```

Manage it with:

```sh
astro dev status
astro dev logs
astro dev stop
```

Other commands:

| Command           | What it does                                           |
| ----------------- | ------------------------------------------------------ |
| `npm run build`   | Runs `astro check` (type checking), then `astro build` |
| `npm test`        | Runs the Vitest suite once (`vitest run`)              |
| `npm run preview` | Serves the production build locally                    |

## Patched dependency

`patches/simple-icons-astro+16.1.0.patch` adds a `LinkedIn` icon component (and its exports) to `simple-icons-astro`, which no longer ships one. `patch-package` applies it on `postinstall`.

The patch is tied to that exact version. When bumping `simple-icons-astro`, regenerate the patch with `npx patch-package simple-icons-astro`, or remove it if it is no longer needed.

## Resume

The resume is written in Typst in a separate repo, [err53/resume](https://github.com/err53/resume). GitHub Actions compiles it and publishes `resume.pdf` as a release asset.

`src/pages/resume.pdf.ts` serves `/resume.pdf` as an on-demand route that proxies `https://github.com/err53/resume/releases/latest/download/resume.pdf`:

- Handles `GET` and `HEAD`, and follows GitHub's redirect to the asset.
- Forwards `Range`, `If-Range`, `If-None-Match`, and `If-Modified-Since` upstream, and passes back `Accept-Ranges`, `Content-Length`, `Content-Range`, `ETag`, and `Last-Modified`, so partial and conditional (`304`) responses work.
- Caches full responses for 10 minutes (`max-age`) and 1 hour at shared caches (`s-maxage`), with a 1 day `stale-while-revalidate`. Range requests get only the 10 minute `max-age`.
- Serves the file inline as `Jason-Huang-Resume.pdf`.
- Times out after 10 seconds and returns an uncached `502` if the upstream fetch fails.

Updating the resume only needs a new release in the resume repo. This site does not need a redeploy.

## Notes

- **Content Security Policy.** Astro's `security.csp` generates a strict CSP with hashes for the site's own scripts and styles. Inline `style` attributes are blocked, so components size things with classes instead. For example, the Last.fm island maps artwork sizes to Tailwind classes rather than setting widths inline.
- **Extra headers.** `vercel.json` adds response headers that Astro's CSP does not cover, such as `frame-ancestors`, HSTS, and `X-Frame-Options`.
- **Open Graph images.** `src/pages/open-graph/[...route].ts` generates social preview images at build time with `astro-og-canvas`.

## License

Original site content is dedicated to the public domain under [CC0](https://creativecommons.org/publicdomain/zero/1.0/), as stated in the site footer.
