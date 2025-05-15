import crypto from "crypto";

import { z } from "zod";
import { env } from "~/env";
import OpenAI from "openai";
import { unstable_cache } from "next/cache";

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

// Helper function to create a hash from track data
function createTrackHash(
  tracksWithTags: Array<{ artist: string; name: string; tags: string[] }>,
): string {
  const trackString = JSON.stringify(
    tracksWithTags.map((t) => ({
      artist: t.artist,
      name: t.name,
      tags: t.tags,
    })),
  );
  return crypto.createHash("md5").update(trackString).digest("hex");
}

// Cache mood analysis results by track hash
async function getCachedMoodAnalysis(
  tracksWithTags: Array<{ artist: string; name: string; tags: string[] }>,
) {
  const trackHash = createTrackHash(tracksWithTags);

  console.log("Track hash", trackHash);

  // Create a specific cache function for this exact set of tracks
  const getMoodForSpecificTracks = unstable_cache(
    async () => {
      console.log("Getting new mood...");

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
        model: "google/gemini-2.0-flash-001",
      });

      console.log("Mood: ", completion.choices[0]?.message?.content?.trim());

      return completion.choices[0]?.message?.content?.trim() ?? "Unknown mood";
    },
    [`lastfm-mood-analysis-${trackHash}`],
    { revalidate: 5 * 60 }, // Cache for 5 minutes
  );

  return getMoodForSpecificTracks();
}

// Cache track tag information for 5 minutes with artist and track in key
async function getTrackTags(
  artist: string,
  trackName: string,
): Promise<string[]> {
  const getTagsForTrack = unstable_cache(
    async () => {
      const params = new URLSearchParams({
        format: "json",
        method: "track.gettoptags",
        artist: artist,
        track: trackName,
        api_key: env.LASTFM_API_KEY,
      });

      const response = await fetch(
        `https://ws.audioscrobbler.com/2.0/?${params}`,
        {
          next: { revalidate: 5 * 60 }, // Cache for 5 minutes
        },
      );

      const data: unknown = await response.json();
      const tags = trackGetTopTagsSchema.parse(data).toptags.tag.slice(0, 5);

      return tags.map((tag) => tag.name);
    },
    [`lastfm-track-tags-${artist}-${trackName}`],
    { revalidate: 5 * 60 }, // Cache for 5 minutes
  );

  return getTagsForTrack();
}

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
          next: { revalidate: 1 }, // Cache for 1 second
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
          next: { revalidate: 1 }, // Cache recent tracks for 1 minute
        },
      );

      const data: unknown = await response.json();
      const recentTracks =
        userGetRecentTracksSchema.parse(data).recenttracks.track;

      // console.log("Recent tracks", recentTracks);

      if (recentTracks.length === 0) {
        return "No recent tracks found.";
      }

      // Get tags for each track (cached per track)
      const tracksWithTags = await Promise.all(
        recentTracks.map(async (track) => {
          const tags = await getTrackTags(track.artist["#text"], track.name);
          return {
            artist: track.artist["#text"],
            name: track.name,
            tags,
          };
        }),
      );

      console.log("Recent tracks with tags", tracksWithTags);

      // Get mood analysis cached by the track set
      return getCachedMoodAnalysis(tracksWithTags);
    }),
});
