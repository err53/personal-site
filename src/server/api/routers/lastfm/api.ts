import { env } from "~/env";
import { trackGetInfoSchema, userGetRecentTracksSchema } from "./types";

export const getRecentTracks = async ({ user, limit }: { user: string, limit: number }) => {
    const params = new URLSearchParams({
        format: "json",
        method: "user.getrecenttracks",
        user,
        api_key: env.LASTFM_API_KEY,
        limit: limit.toString(),
    });

    const response = await fetch(
        `https://ws.audioscrobbler.com/2.0/?${params}`,
        {
            next: { revalidate: 1 }, // Cache for 1 second
        },
    );

    const data: unknown = await response.json();
    return userGetRecentTracksSchema.parse(data).recenttracks.track;
};

export const getTrackInfo = async ({ artist, track }: { artist: string, track: string }) => {
    const params = new URLSearchParams({
        format: "json",
        method: "track.getInfo",
        artist,
        track,
        api_key: env.LASTFM_API_KEY,
    });

    const response = await fetch(
        `https://ws.audioscrobbler.com/2.0/?${params}`,
        {
            next: { revalidate: 5 * 60 }, // Cache for 5 minutes
        },
    );

    const data: unknown = await response.json();
    return trackGetInfoSchema.parse(data).track;
};