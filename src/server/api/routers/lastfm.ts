import { z } from "zod";
import { env } from "~/env";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const baseTrackSchema = z.object({
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

const nowPlayingTrackSchema = baseTrackSchema.merge(
  z.object({
    "@attr": z.object({
      nowplaying: z.coerce.boolean(),
    }),
  }),
);

const trackSchema = baseTrackSchema.merge(
  z.object({
    date: z.object({
      uts: z.coerce.number(),
      "#text": z.coerce.date(),
    }),
  }),
);

const getRecentTracksSchema = z.object({
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

export const lastfmRouter = createTRPCRouter({
  getLatestTrack: publicProcedure
    .input(z.object({ user: z.string() }))
    .query(async ({ input }) => {
      const response = await fetch(
        "https://ws.audioscrobbler.com/2.0/?" +
          "format=json" +
          "&method=user.getrecenttracks" +
          `&user=${input.user}` +
          `&api_key=${env.LASTFM_API_KEY}` +
          "&limit=1",
        {
          cache: "force-cache",
          next: {
            revalidate: 1, // Cache for 1 second
          },
        },
      );

      const data: unknown = await response.json();
      return getRecentTracksSchema.parse(data).recenttracks.track[0];
    }),
});
