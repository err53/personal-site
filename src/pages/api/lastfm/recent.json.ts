import type { APIRoute } from "astro";

import { getRecentTracks } from "../../../lib/lastfm/client";

export const prerender = false;

// The current track plus 10 more; the card already shows the current one, so drop it.
const TRACK_LIMIT = 11;

const responseHeaders = {
  // History changes less often than the current track, so it can be cached longer.
  "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=300",
  "Content-Type": "application/json; charset=utf-8",
};

export const GET = (async () => {
  try {
    const [, ...tracks] = await getRecentTracks(TRACK_LIMIT);

    return new Response(JSON.stringify({ tracks }), {
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Failed to fetch recent Last.fm tracks", error);

    return new Response(JSON.stringify({ error: "Last.fm is unavailable" }), {
      status: 502,
      headers: {
        ...responseHeaders,
        "Cache-Control": "no-store",
      },
    });
  }
}) satisfies APIRoute;
