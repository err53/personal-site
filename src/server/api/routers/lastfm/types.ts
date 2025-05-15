import { z } from "zod";

export const baseTrackSchema = z.object({
  artist: z.object({
    mbid: z.string().optional(),
    "#text": z.string(),
  }),
  streamable: z.string(),
  image: z.array(
    z.object({
      size: z.enum(["small", "medium", "large", "extralarge"]),
      "#text": z.string().url(),
    }),
  ),
  mbid: z.string().optional(),
  album: z.object({
    mbid: z.string().optional(),
    "#text": z.string(),
  }),
  name: z.string(),
  url: z.string().url(),
});

export const nowPlayingTrackSchema = baseTrackSchema.merge(
  z.object({
    "@attr": z.object({
      nowplaying: z.coerce.boolean(),
    }),
  }),
);

export const trackSchema = baseTrackSchema.merge(
  z.object({
    date: z.object({
      uts: z.coerce.number(),
      "#text": z.coerce.date(),
    }),
  }),
);

export const userGetRecentTracksSchema = z.object({
  recenttracks: z.object({
    track: z.array(z.union([nowPlayingTrackSchema, trackSchema])),
    "@attr": z.object({
      user: z.string(),
      totalPages: z.coerce.number(),
      page: z.coerce.number(),
      perPage: z.coerce.number(),
      total: z.coerce.number(),
    }),
  }),
});

export const trackGetTopTagsSchema = z.object({
  toptags: z.object({
    tag: z.array(
      z.object({
        name: z.string(),
        url: z.string().url(),
        count: z.coerce.number(),
      }),
    ),
    "@attr": z.object({
      artist: z.string(),
      mbid: z.string().optional(),
      track: z.string(),
    }),
  }),
});
