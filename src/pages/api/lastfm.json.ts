import type { APIRoute } from "astro";

import { getRecentTracks } from "../../lib/lastfm/client";

export const prerender = false;

const responseHeaders = {
  "Cache-Control": "public, max-age=0, s-maxage=5, stale-while-revalidate=30",
  "Content-Type": "application/json; charset=utf-8",
};

export const GET = (async () => {
  try {
    const [track = null] = await getRecentTracks(1);

    return new Response(JSON.stringify({ track }), {
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Failed to fetch latest Last.fm track", error);

    return new Response(JSON.stringify({ error: "Last.fm is unavailable" }), {
      status: 502,
      headers: {
        ...responseHeaders,
        "Cache-Control": "no-store",
      },
    });
  }
}) satisfies APIRoute;
