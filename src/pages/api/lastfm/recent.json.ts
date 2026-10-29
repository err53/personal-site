import type { APIRoute } from "astro";

import { getRecentTracks } from "../../../lib/lastfm/client";

export const prerender = false;

// Enough for 10 rows after the client removes the current track and its possible duplicate.
const TRACK_LIMIT = 12;

const responseHeaders = {
  // History changes less often than the current track, so it can be cached longer.
  // Keep the stale window short so the client's 30s refresh gets recent data.
  "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=60",
  "Content-Type": "application/json; charset=utf-8",
};

export const GET = (async () => {
  try {
    const tracks = await getRecentTracks(TRACK_LIMIT);

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
