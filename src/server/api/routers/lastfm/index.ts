import { z } from "zod";
import { env } from "~/env";
import OpenAI from "openai";

import { userGetRecentTracksSchema, trackGetTopTagsSchema } from "./types";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": env.VERCEL_URL ? `https://${env.VERCEL_URL}` : undefined,
    "X-Title": "Jason's Personal Site",
  },
});

export const lastfmRouter = createTRPCRouter({
  getLatestTrack: publicProcedure
    .input(z.object({ user: z.string() }))
    .query(async ({ input }) => {
      const params = new URLSearchParams({
        format: "json",
        method: "user.getrecenttracks",
        user: input.user,
        api_key: env.LASTFM_API_KEY,
        limit: "1",
      });

      const response = await fetch(
        `https://ws.audioscrobbler.com/2.0/?${params}`,
        {
          cache: "force-cache",
          next: {
            revalidate: 1, // Cache for 1 second
          },
        },
      );

      const data: unknown = await response.json();
      return userGetRecentTracksSchema.parse(data).recenttracks.track[0];
    }),
  getRecentMood: publicProcedure
    .input(z.object({ user: z.string() }))
    .query(async ({ input }) => {
      const params = new URLSearchParams({
        format: "json",
        method: "user.getrecenttracks",
        user: input.user,
        api_key: env.LASTFM_API_KEY,
        limit: "10",
      });

      const response = await fetch(
        `https://ws.audioscrobbler.com/2.0/?${params}`,
        {
          cache: "force-cache",
          next: {
            revalidate: 1, // Cache for 1 second
          },
        },
      );

      const data: unknown = await response.json();
      const recentTracks =
        userGetRecentTracksSchema.parse(data).recenttracks.track;

      if (recentTracks.length === 0) {
        return "No recent tracks found.";
      }

      // loop through all tracks and get tags
      const tracksWithTags = await Promise.all(
        recentTracks.map(async (track) => {
          const params = new URLSearchParams({
            format: "json",
            method: "track.gettoptags",
            artist: track.artist["#text"],
            track: track.name,
            api_key: env.LASTFM_API_KEY,
          });
          const response = await fetch(
            `https://ws.audioscrobbler.com/2.0/?${params}`,
            {
              cache: "force-cache",
            },
          );
          const data: unknown = await response.json();
          const tags = trackGetTopTagsSchema
            .parse(data)
            .toptags.tag.slice(0, 5);
          return {
            artist: track.artist["#text"],
            name: track.name,
            tags: tags.map((tag) => tag.name),
          };
        }),
      );

      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "user",
            content: [
              "Based on the following recent tracks, what mood do you think I am in?",
              ...tracksWithTags.map(
                (track) =>
                  `- ${track.artist} - ${track.name} (${track.tags.join(", ")})`,
              ),
              "Please respond with a single word or short phrase. Do not use markdown.",
            ].join("\n"),
          },
        ],
        model: "deepseek/deepseek-chat-v3-0324:free",
      });

      const mood =
        completion.choices[0]?.message?.content?.trim() ?? "Unknown mood";
      return mood;
    }),
});
