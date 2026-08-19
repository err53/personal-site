import { LASTFM_API_KEY } from "astro:env/server";

import {
  parseLatestTrack,
  type LatestTrack,
} from "./schema";

const LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/";
const LASTFM_USER = "err53";
const REQUEST_TIMEOUT_MS = 5_000;

export async function getLatestTrack(): Promise<LatestTrack | null> {
  const url = new URL(LASTFM_API_URL);
  url.search = new URLSearchParams({
    method: "user.getrecenttracks",
    user: LASTFM_USER,
    api_key: LASTFM_API_KEY,
    format: "json",
    limit: "1",
  }).toString();

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Last.fm returned HTTP ${response.status}`);
  }

  const payload: unknown = await response.json();
  return parseLatestTrack(payload, LASTFM_USER);
}
