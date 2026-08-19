import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/preact-query";

import type { LatestTrack } from "../../../lib/lastfm/schema";

type Props = {
  endpoint: string;
  profileUrl: string;
};

type LastFmResponse = {
  track: LatestTrack | null;
};

const POLL_INTERVAL_MS = 10_000;
const queryClient = new QueryClient();

export default function LastFMIsland(props: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <LastFMCard {...props} />
    </QueryClientProvider>
  );
}

function LastFMCard({ endpoint, profileUrl }: Props) {
  const query = useQuery<LastFmResponse>({
    queryKey: ["lastfm", "latest", endpoint],
    queryFn: async ({ signal }) => {
      const response = await fetch(endpoint, {
        headers: { Accept: "application/json" },
        signal,
      });
      if (!response.ok) throw new Error(`Request failed with ${response.status}`);
      return response.json();
    },
    refetchInterval: POLL_INTERVAL_MS,
  });

  const track = query.data?.track ?? null;

  return (
    <a
      href={track?.profileUrl ?? profileUrl}
      data-playing={track?.nowPlaying ?? false}
      class="flex min-h-20 flex-row items-center gap-3 border border-neutral-200 p-2 shadow-md transition-all duration-300 hover:bg-neutral-100 hover:text-neutral-900 active:shadow-none"
    >
      <div class="size-16 shrink-0" data-artwork>
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
          />
        ) : (
          <div
            class="lastfm-record flex size-16 items-center justify-center rounded-full bg-neutral-800"
            aria-hidden="true"
          >
            <span class="size-5 rounded-full border-4 border-neutral-300 bg-neutral-100" />
          </div>
        )}
      </div>
      <div class="min-w-0" aria-live="polite">
        <p class="text-sm text-neutral-500">{getStatusText(query, track)}</p>
        <p class="truncate font-medium">
          {track?.name ?? getFallbackText(query.isPending)}
        </p>
        {track && (
          <p class="truncate text-sm text-neutral-600">by {track.artist}</p>
        )}
        {track && query.isRefetchError && (
          <p class="text-xs text-neutral-500">
            Latest refresh failed; showing previous track.
          </p>
        )}
      </div>
    </a>
  );
}

function getStatusText(
  query: { isPending: boolean; isError: boolean },
  track: LatestTrack | null,
) {
  if (query.isPending) return "Checking Last.fm...";
  if (query.isError && !track) return "Last.fm is unavailable.";
  if (!track) return "No recent tracks found.";
  return track.nowPlaying ? "Listening to:" : "Last listened to:";
}

function getFallbackText(isPending: boolean) {
  return isPending
    ? "Loading recent track..."
    : "Visit my Last.fm profile";
}
