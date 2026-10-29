import { useStore } from "@nanostores/preact";
import { nanoquery, type FetcherValue } from "@nanostores/query";
import { ChevronDown } from "lucide-preact";
import { atom } from "nanostores";
import { useId, useState } from "preact/hooks";

import {
  getPlayHistory,
  type LatestTrack,
} from "../../../lib/lastfm/schema";
import styles from "./LastFMIsland.module.css";

type Props = {
  profileUrl: string;
};

type LastFmResponse = {
  track: LatestTrack | null;
};

type RecentTracksResponse = {
  tracks: LatestTrack[];
};

const POLL_INTERVAL_MS = 10_000;
const HISTORY_ROWS = 10;
const RECENT_ENDPOINT = "/api/lastfm/recent.json";
// Matches s-maxage on the recent route, so refetching sooner gains nothing.
const RECENT_MAX_AGE_MS = 30_000;

async function fetchJson(endpoint: unknown) {
  const response = await fetch(String(endpoint), {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Request failed with ${response.status}`);
  return response.json();
}

const [createFetcherStore] = nanoquery({ fetcher: fetchJson });

const $latestTrack = createFetcherStore<LastFmResponse>("/api/lastfm.json", {
  revalidateInterval: POLL_INTERVAL_MS,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
});

let recentFetchedAt = 0;

// Stays null (so nothing is fetched) until someone shows interest in the list.
const $recentEndpoint = atom<string | null>(null);
const $recentTracks = createFetcherStore<RecentTracksResponse>(
  [$recentEndpoint],
  {
    fetcher: async (endpoint) => {
      const data = await fetchJson(endpoint);
      recentFetchedAt = Date.now();
      return data;
    },
    dedupeTime: RECENT_MAX_AGE_MS,
    revalidateOnFocus: false,
  },
);

// Starts loading on hover/focus so the list is usually ready by the time the card opens.
function loadRecentTracks() {
  $recentEndpoint.set(RECENT_ENDPOINT);
}

function refreshRecentTracksIfStale() {
  loadRecentTracks();
  if (recentFetchedAt && Date.now() - recentFetchedAt > RECENT_MAX_AGE_MS) {
    $recentTracks.revalidate();
  }
}

const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export default function LastFMIsland({ profileUrl }: Props) {
  const query = useStore($latestTrack, { ssr: "initial" });
  const recentQuery = useStore($recentTracks, { ssr: "initial" });
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const track = query.data?.track ?? null;
  const recent = getPlayHistory(recentQuery.data?.tracks ?? [], track).slice(
    0,
    HISTORY_ROWS,
  );

  function toggle() {
    if (!expanded) refreshRecentTracksIfStale();
    setExpanded(!expanded);
  }

  return (
    <div class="interactive-surface">
      <button
        type="button"
        class="flex min-h-20 w-full cursor-pointer flex-row items-center gap-3 p-2 text-left"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={toggle}
        onPointerEnter={loadRecentTracks}
        onFocus={loadRecentTracks}
      >
        <div
          class={`size-16 shrink-0 ${track?.nowPlaying ? styles.spinning : ""}`}
        >
          <Artwork track={track} size="lg" />
        </div>
        <div class="min-w-0 flex-1" aria-live="polite">
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
        <ChevronDown
          size={20}
          class={`shrink-0 text-neutral-500 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
        />
        <span class="sr-only">
          {expanded ? "Hide recently played" : "Show recently played"}
        </span>
      </button>

      <div
        id={panelId}
        class={`grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        inert={!expanded}
      >
        <div class="overflow-hidden">
          <div class="border-t border-neutral-200 p-2">
            <p class="pb-2 text-sm text-neutral-500">Recently played</p>
            {recent.length > 0 ? (
              <ol class="flex flex-col">
                {recent.map((item) => (
                  <li key={`${item.trackUrl}-${item.playedAt}`}>
                    <a
                      href={item.trackUrl}
                      class="flex items-center gap-3 rounded p-1 transition-colors hover:bg-neutral-200"
                    >
                      <Artwork track={item} size="sm" square />
                      <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium">{item.name}</p>
                        <p class="truncate text-xs text-neutral-600">
                          {item.artist}
                        </p>
                      </div>
                      {item.playedAt && (
                        <time
                          class="shrink-0 text-xs text-neutral-500"
                          dateTime={item.playedAt}
                        >
                          {formatPlayedAt(item.playedAt)}
                        </time>
                      )}
                    </a>
                  </li>
                ))}
              </ol>
            ) : (
              <p class="text-sm text-neutral-600">
                {getRecentFallbackText(recentQuery)}
              </p>
            )}
            <a
              href={track?.profileUrl ?? profileUrl}
              class="mt-2 block p-1 text-sm text-neutral-600 underline-offset-2 hover:underline"
            >
              View full history on Last.fm →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline styles are blocked by the site's CSP, so sizes must come from classes.
const artworkSizes = {
  lg: { px: 64, box: "size-16", hole: "size-5 border-4" },
  sm: { px: 40, box: "size-10", hole: "size-3 border-2" },
};

function Artwork({
  track,
  size,
  square = false,
}: {
  track: LatestTrack | null;
  size: keyof typeof artworkSizes;
  square?: boolean;
}) {
  const { px, box, hole } = artworkSizes[size];
  const shape = square ? "rounded" : "rounded-full";
  // List rows already name the track, so their thumbnails are decorative.
  const src = size === "sm" ? track?.thumbnailUrl : track?.imageUrl;

  if (track && src) {
    return (
      <img
        class={`${box} shrink-0 object-cover ${shape}`}
        src={src}
        width={px}
        height={px}
        alt={
          size === "sm"
            ? ""
            : `${track.album || track.name} album cover`
        }
        loading="lazy"
      />
    );
  }

  return (
    <div
      class={`${styles.record} ${box} flex shrink-0 items-center justify-center bg-neutral-800 ${shape}`}
      aria-hidden="true"
    >
      <span class={`${hole} rounded-full border-neutral-300 bg-neutral-100`} />
    </div>
  );
}

function formatPlayedAt(playedAt: string) {
  const seconds = (new Date(playedAt).getTime() - Date.now()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];

  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) {
      return relativeTime.format(Math.round(seconds / size), unit);
    }
  }
  return "just now";
}

function getRecentFallbackText(state: FetcherValue<RecentTracksResponse>) {
  if (state.data) return "Nothing else played recently.";
  if (state.error) return "Couldn't load recent tracks.";
  return "Loading...";
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
