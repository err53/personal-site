import { z } from "zod";
import { unstable_cache } from "next/cache";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getRecentTracks, getTrackInfo } from "./api";
import { nowPlayingTrackSchema, trackSchema } from "./types";

import { openrouter } from "~/server/openrouter";

import { systemPrompt, userPrompt } from "./prompts";
import { env } from "~/env";

const analyzeRecentMood = unstable_cache(
  async (user: string) => {
    const recentTracks = await getRecentTracks({
      user,
      limit: 10,
    });

    if (recentTracks.length === 0) {
      return "No recent tracks found.";
    }

    const detailedTracks = await Promise.all(
      recentTracks.map(async (track) =>
        getTrackInfo({
          artist: track.artist["#text"],
          track: track.name,
        }),
      ),
    );

    const completion = await openrouter.chat.completions.create({
      model: "openrouter/auto",
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: systemPrompt,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt(JSON.stringify(detailedTracks, null, 2)),
            },
          ],
        },
      ],
    });

    return (
      completion.choices[0]?.message.content ??
      "Unable to analyze recent tracks."
    );
  },
  ["lastfm", "recent-mood-analysis"],
  { revalidate: env.NODE_ENV === "development" ? 1 : 60 * 15 },
);

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
    .query(async ({ input }) => analyzeRecentMood(input.user)),
});
