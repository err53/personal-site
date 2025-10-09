import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getRecentTracks } from "./api";


export const lastfmRouter = createTRPCRouter({
  getLatestTrack: publicProcedure
    .input(z.object({ user: z.string() }))
    .query(async ({ input }) => {
      return getRecentTracks({ user: input.user, limit: 1 });
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
