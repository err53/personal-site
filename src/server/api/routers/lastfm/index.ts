import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getRecentTracks } from "./api";
import { nowPlayingTrackSchema, trackSchema } from "./types";


export const lastfmRouter = createTRPCRouter({
  getLatestTrack: publicProcedure
    .input(z.object({ user: z.string() }))
    .output(z.union([nowPlayingTrackSchema, trackSchema]).nullable())
    .query(async ({ input }) => {
      const [latestTrack] = await getRecentTracks({
        user: input.user,
        limit: 1,
      });

      return latestTrack ?? null;
    }),
  getRecentMood: publicProcedure
    .input(z.object({ user: z.string() }))
    .output(z.string())
    .query(async ({ input }) => {
      const recentTracks = await getRecentTracks({ user: input.user, limit: 10 });

      if (recentTracks.length === 0) {
        return "No recent tracks found.";
      }

      return "test";
    }),
});
