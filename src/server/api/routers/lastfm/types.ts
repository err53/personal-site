import { z } from "zod";

const imageUrlSchema = z.union([z.string().url(), z.literal("")]);

export const baseTrackSchema = z.object({
  artist: z.object({
    mbid: z.string().optional(),
    "#text": z.string(),
  }),
  streamable: z.string(),
  image: z.array(
    z.object({
      size: z.enum(["small", "medium", "large", "extralarge"]),
      "#text": imageUrlSchema,
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

export const trackGetInfoSchema = z.object({
  track: z.object({
    name: z.string(),
    mbid: z.string().optional(),
    url: z.string().url(),
    duration: z.string().optional(),
    streamable: z.object({
      "#text": z.string(),
      fulltrack: z.string(),
    }),
    listeners: z.string(),
    playcount: z.string(),
    artist: z.object({
      name: z.string(),
      mbid: z.string().optional(),
      url: z.string().url(),
    }),
    album: z
      .object({
        artist: z.string(),
        title: z.string(),
        url: z.string().url(),
        image: z.array(
          z.object({
            "#text": imageUrlSchema,
            size: z.enum(["small", "medium", "large", "extralarge"]),
          }),
        ),
      })
      .optional(),
    toptags: z
      .object({
        tag: z.array(
          z.object({
            name: z.string(),
            url: z.string().url(),
          }),
        ),
      })
      .optional(),
    wiki: z
      .object({
        published: z.string(),
        summary: z.string(),
        content: z.string(),
      })
      .optional(),
  }),
});

export const trackGetTopTagsSchema = z.object({
  toptags: z
    .object({
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
    })
    .optional(),
});
