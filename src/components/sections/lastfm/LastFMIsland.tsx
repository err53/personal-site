import { useStore } from "@nanostores/preact";
import { nanoquery, type FetcherValue } from "@nanostores/query";

import type { LatestTrack } from "../../../lib/lastfm/schema";
import styles from "./LastFMIsland.module.css";

type Props = {
  profileUrl: string;
};

type LastFmResponse = {
  track: LatestTrack | null;
};

const POLL_INTERVAL_MS = 10_000;
const [createFetcherStore] = nanoquery();
const $latestTrack = createFetcherStore<LastFmResponse>("/api/lastfm.json", {
  fetcher: async (endpoint) => {
    const response = await fetch(String(endpoint), {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Request failed with ${response.status}`);
    return response.json() as Promise<LastFmResponse>;
  },
  revalidateInterval: POLL_INTERVAL_MS,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
});

export default function LastFMIsland({ profileUrl }: Props) {
  const query = useStore($latestTrack, { ssr: "initial" });
  const track = query.data?.track ?? null;

  return (
    <a
      href={track?.profileUrl ?? profileUrl}
      class="flex min-h-20 flex-row items-center gap-3 border border-neutral-200 p-2 shadow-md transition-all duration-300 hover:bg-neutral-100 hover:text-neutral-900 active:shadow-none"
    >
      <div
        class={`size-16 shrink-0 ${track?.nowPlaying ? styles.spinning : ""}`}
      >
        {track?.imageUrl ? (
          <img
            class="size-16 rounded-full object-cover"
            src={track.imageUrl}
            width={64}
            height={64}
            alt={
              track.album
                ? `${track.album} album cover`
                : `${track.name} album cover`
            }
            loading="lazy"
          />
        ) : (
          <div
            class={`${styles.record} flex size-16 items-center justify-center rounded-full bg-neutral-800`}
            aria-hidden="true"
          >
            <span class="size-5 rounded-full border-4 border-neutral-300 bg-neutral-100" />
          </div>
        )}
      </div>
      <div class="min-w-0" aria-live="polite">
        <p class="text-sm text-neutral-500">{getStatusText(query)}</p>
        <p class="truncate font-medium">
          {track?.name ?? getFallbackText(query)}
        </p>
        {track && (
          <p class="truncate text-sm text-neutral-600">by {track.artist}</p>
        )}
        {track && query.error && (
          <p class="text-xs text-neutral-500">
            Latest refresh failed; showing previous track.
          </p>
        )}
      </div>
    </a>
  );
}

function getStatusText(state: FetcherValue<LastFmResponse>) {
  const track = state.data?.track ?? null;

  if (!state.data && !state.error) return "Checking Last.fm...";
  if (state.error && !track) return "Last.fm is unavailable.";
  if (!track) return "No recent tracks found.";
  return track.nowPlaying ? "Listening to:" : "Last listened to:";
}

function getFallbackText(state: FetcherValue<LastFmResponse>) {
  return !state.data && !state.error
    ? "Loading recent track..."
    : "Visit my Last.fm profile";
}
