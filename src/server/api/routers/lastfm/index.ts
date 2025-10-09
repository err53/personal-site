import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getRecentTracks, getTrackInfo } from "./api";
import { nowPlayingTrackSchema, trackSchema } from "./types";
import { promises as fs } from 'fs';

import { openrouter } from "~/server/openrouter";

const systemPrompt = await fs.readFile(process.cwd() + '/src/server/api/routers/lastfm/system_prompt.txt', 'utf8');

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
      // get 10 most recent tracks
      const recentTracks = await getRecentTracks({
        user: input.user,
        limit: 10,
      });

      if (recentTracks.length === 0) {
        return "No recent tracks found.";
      }

      // get data about each track
      const detailedTracks = await Promise.all(
        recentTracks.map(async (track) =>
          getTrackInfo({
            artist: track.artist["#text"],
            track: track.name,
          }),
        ),
      );

      // run analysis

      const completion = await openrouter.chat.completions.create({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: [
              {
                type: "text",
                text: systemPrompt,
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze the following 10 recently played tracks and return **one sentence** describing the user's current mood.
**Tracks JSON (verbatim):**

\`\`\`
${JSON.stringify(detailedTracks, null, 2)}
\`\`\``
              }
            ]
          }
        ]
      })

      return completion.choices[0]?.message.content ?? "Unable to analyze recent tracks.";
    }),
});
