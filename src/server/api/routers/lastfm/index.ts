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

    const detailedTracks = await Promise.allSettled(
      recentTracks.map(async (track) =>
        getTrackInfo({
          artist: track.artist["#text"],
          track: track.name,
        }),
      ),
    );

    const compactTracks = detailedTracks
      .map((trackResult, index) => {
        const fallbackTrack = recentTracks[index];

        if (trackResult.status === "rejected") {
          return {
            name: fallbackTrack?.name ?? "",
            artist: fallbackTrack?.artist?.["#text"] ?? "",
            album: fallbackTrack?.album?.["#text"] ?? "",
            tags: [] as string[],
            wikiSummary: "",
          };
        }

        const detailedTrack = trackResult.value;

        return {
          name: detailedTrack.name,
          artist: detailedTrack.artist.name,
          album: detailedTrack.album?.title ?? "",
          tags: (detailedTrack.toptags?.tag ?? [])
            .map((tag) => tag.name)
            .filter(Boolean)
            .slice(0, 8),
          wikiSummary: detailedTrack.wiki?.summary
            ?.replace(/<[^>]*>/g, "")
            .trim()
            .slice(0, 280),
        };
      })
      .filter((track) => track.name && track.artist);

    const completion = await openrouter.chat.completions.create({
      model: "google/gemini-2.5-flash",
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
              text: userPrompt(JSON.stringify(compactTracks, null, 2)),
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
  {
    revalidate: env.NODE_ENV === "development" ? 1 : 60 * 15,
    tags: ["lastfm", "recent-mood-analysis"],
  },
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
