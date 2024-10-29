import { z } from "zod";

const trackSchema = z.object({
  artist: z.object({
    mbid: z.string(),
    "#text": z.string(),
  }),
  streamable: z.string(),
  image: z.array(
    z.object({
      size: z.enum(["small", "medium", "large", "extralarge"]),
      "#text": z.string().url(),
    }),
  ),
  mbid: z.string(),
  album: z.object({
    mbid: z.string(),
    "#text": z.string(),
  }),
  name: z.string(),
  url: z.string().url(),
});

const nowPlayingTrackSchema = trackSchema.merge(
  z.object({
    "@attr": z.object({
      nowplaying: z.coerce.boolean(),
    }),
  }),
);

const pastTrackSchema = trackSchema.merge(
  z.object({
    date: z.object({
      uts: z.coerce.number(),
      "#text": z.coerce.date(),
    }),
  }),
);

const getrecenttracksSchema = z.object({
  recenttracks: z.object({
    track: z.array(z.union([nowPlayingTrackSchema, pastTrackSchema])),
    "@attr": z.object({
      user: z.string(),
      totalPages: z.coerce.number(),
      page: z.coerce.number(),
      perPage: z.coerce.number(),
      total: z.coerce.number(),
    }),
  }),
});

export default async function getLatestTrack({
  queryKey,
}: {
  queryKey: string[];
}) {
  if (!process.env.NEXT_PUBLIC_LASTFM_API_KEY) {
    throw new Error("NEXT_PUBLIC_LASTFM_API_KEY is not set");
  }

  const [_, user, params] = queryKey;
  const response = await fetch(
    "https://ws.audioscrobbler.com/2.0/?format=json&method=user.getrecenttracks" +
      `&user=${user}` +
      `&api_key=${process.env.NEXT_PUBLIC_LASTFM_API_KEY}` +
      params,
    { cache: "no-store" },
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return getrecenttracksSchema.parse(data);
}
