import { z } from "zod";

const imageSchema = z.object({
  size: z.string(),
  "#text": z.string(),
});

export const recentTrackSchema = z.object({
  artist: z.object({ "#text": z.string() }),
  album: z.object({ "#text": z.string() }).optional(),
  image: z.array(imageSchema).optional(),
  name: z.string(),
  url: z.string(),
  "@attr": z
    .object({ nowplaying: z.enum(["true", "false"]) })
    .optional(),
  date: z.object({ uts: z.string().optional() }).optional(),
});

export const recentTracksResponseSchema = z.object({
  recenttracks: z.object({
    track: z.array(recentTrackSchema),
  }),
});

export type RecentTrack = z.infer<typeof recentTrackSchema>;

export type LatestTrack = {
  name: string;
  artist: string;
  album: string;
  imageUrl: string | null;
  // Smaller cover for list rows; "large" is 174px, enough for 40px on high-DPI screens.
  thumbnailUrl: string | null;
  trackUrl: string;
  profileUrl: string;
  nowPlaying: boolean;
  playedAt: string | null;
};

type LastFmErrorResponse = {
  error?: unknown;
  message?: unknown;
};

const preferredImageSizes = ["extralarge", "large", "medium", "small"];
const preferredThumbnailSizes = ["large", "medium", "extralarge", "small"];

function pickImage(images: RecentTrack["image"], sizes: string[]) {
  return (
    sizes
      .map((size) => images?.find((image) => image.size === size)?.["#text"])
      .find((url) => Boolean(url)) ?? null
  );
}

export function normalizeTrack(track: RecentTrack, user: string): LatestTrack {
  const playedAtSeconds = Number(track.date?.uts);

  return {
    name: track.name,
    artist: track.artist["#text"],
    album: track.album?.["#text"] ?? "",
    imageUrl: pickImage(track.image, preferredImageSizes),
    thumbnailUrl: pickImage(track.image, preferredThumbnailSizes),
    trackUrl: track.url,
    profileUrl: `https://www.last.fm/user/${encodeURIComponent(user)}`,
    nowPlaying: track["@attr"]?.nowplaying === "true",
    playedAt:
      Number.isFinite(playedAtSeconds) && playedAtSeconds > 0
        ? new Date(playedAtSeconds * 1000).toISOString()
        : null,
  };
}

export function parseRecentTracks(payload: unknown, user: string): LatestTrack[] {
  const providerError = payload as LastFmErrorResponse;

  if (providerError?.error !== undefined) {
    const message =
      typeof providerError.message === "string"
        ? providerError.message
        : "Unknown provider error";
    throw new Error(`Last.fm rejected the request: ${message}`);
  }

  const parsed = recentTracksResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error("Last.fm returned an unexpected response");
  }

  return parsed.data.recenttracks.track.map((track) =>
    normalizeTrack(track, user),
  );
}

export function parseLatestTrack(payload: unknown, user: string): LatestTrack | null {
  return parseRecentTracks(payload, user)[0] ?? null;
}

/**
 * Turns the raw recent-tracks list into play history, minus whatever the card is showing.
 * The two endpoints are cached separately, so this matches by play instead of position.
 */
export function getPlayHistory(
  tracks: LatestTrack[],
  current: LatestTrack | null,
): LatestTrack[] {
  const history = tracks.filter(
    (track) =>
      !track.nowPlaying &&
      !(
        current &&
        track.trackUrl === current.trackUrl &&
        track.playedAt === current.playedAt
      ),
  );

  // Last.fm logs a play about halfway through a song, so the song still playing
  // can already appear as the newest finished play.
  if (current?.nowPlaying && history[0]?.trackUrl === current.trackUrl) {
    history.shift();
  }

  return history;
}
