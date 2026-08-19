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

export function normalizeTrack(track: RecentTrack, user: string): LatestTrack {
  const images = track.image ?? [];
  const imageUrl = preferredImageSizes
    .map((size) => images.find((image) => image.size === size)?.["#text"])
    .find((url) => Boolean(url)) ?? null;
  const playedAtSeconds = Number(track.date?.uts);

  return {
    name: track.name,
    artist: track.artist["#text"],
    album: track.album?.["#text"] ?? "",
    imageUrl,
    trackUrl: track.url,
    profileUrl: `https://www.last.fm/user/${encodeURIComponent(user)}`,
    nowPlaying: track["@attr"]?.nowplaying === "true",
    playedAt:
      Number.isFinite(playedAtSeconds) && playedAtSeconds > 0
        ? new Date(playedAtSeconds * 1000).toISOString()
        : null,
  };
}

export function parseLatestTrack(payload: unknown, user: string): LatestTrack | null {
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

  const track = parsed.data.recenttracks.track[0];
  return track ? normalizeTrack(track, user) : null;
}
