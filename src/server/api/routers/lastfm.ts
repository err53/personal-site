import { createHash } from "crypto";
import { z } from "zod";
import { env } from "~/env";

import { tracked } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const baseTrackSchema = z.object({
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
  subscribeToLatestTrack: publicProcedure
    .input(z.object({ user: z.string(), lastEventId: z.string().nullish() }))
    .subscription(async function* ({ input }) {
      const POLL_INTERVAL_MS = 1000;
      const API_URL = "https://ws.audioscrobbler.com/2.0/";

      // Track the last seen hash locally
      let lastSeenHash = input.lastEventId;

      try {
        // Keep subscription alive indefinitely
        while (true) {
          try {
            // Construct the Last.fm API request URL with query parameters
            const params = new URLSearchParams({
              format: "json",
              method: "user.getrecenttracks",
              user: input.user,
              api_key: env.LASTFM_API_KEY,
              limit: "1",
            });

            const response = await fetch(`${API_URL}?${params}`, {
              cache: "no-store", // Disable caching for real-time updates
              headers: {
                "User-Agent": "trpc-lastfm-subscription",
              },
            });

            if (!response.ok) {
              throw new Error(
                `Last.fm API error: ${response.status} ${response.statusText}`,
              );
            }

            const data: unknown = await response.json();
            const track =
              getRecentTracksSchema.parse(data).recenttracks.track[0];

            // Generate a hash of the track data to detect changes
            const trackHash = createHash("sha256")
              .update(JSON.stringify(track))
              .digest("hex");

            // Only yield if the track has changed from our last seen hash
            if (trackHash !== lastSeenHash) {
              lastSeenHash = trackHash; // Update our local tracking
              yield tracked(trackHash, track);
            }
          } catch (error) {
            console.error("Error fetching Last.fm data:", error);
            // Don't yield on error, just continue polling
          }

          // Wait before next poll
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        }
      } finally {
        console.log(`Last.fm subscription for user ${input.user} ended`);
      }
    }),
});
