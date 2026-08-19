import { describe, expect, it } from "vitest";

import {
  normalizeTrack,
  parseLatestTrack,
  recentTracksResponseSchema,
} from "./schema";

const baseTrack = {
  artist: { "#text": "Massive Attack" },
  album: { "#text": "Mezzanine" },
  image: [
    { size: "small", "#text": "https://example.com/small.jpg" },
    { size: "large", "#text": "https://example.com/large.jpg" },
    { size: "extralarge", "#text": "https://example.com/xl.jpg" },
  ],
  name: "Teardrop",
  url: "https://www.last.fm/music/Massive+Attack/_/Teardrop",
  date: { uts: "1724097600" },
};

describe("normalizeTrack", () => {
  it("normalizes a historical track and chooses the largest image", () => {
    const parsed = recentTracksResponseSchema.parse({
      recenttracks: { track: [baseTrack] },
    });

    expect(normalizeTrack(parsed.recenttracks.track[0]!, "err53")).toEqual({
      name: "Teardrop",
      artist: "Massive Attack",
      album: "Mezzanine",
      imageUrl: "https://example.com/xl.jpg",
      trackUrl: "https://www.last.fm/music/Massive+Attack/_/Teardrop",
      profileUrl: "https://www.last.fm/user/err53",
      nowPlaying: false,
      playedAt: "2024-08-19T20:00:00.000Z",
    });
  });

  it("recognizes now-playing tracks and tolerates missing artwork", () => {
    const parsed = recentTracksResponseSchema.parse({
      recenttracks: {
        track: [
          {
            ...baseTrack,
            image: [],
            date: undefined,
            "@attr": { nowplaying: "true" },
          },
        ],
      },
    });

    expect(normalizeTrack(parsed.recenttracks.track[0]!, "err53")).toMatchObject({
      imageUrl: null,
      nowPlaying: true,
      playedAt: null,
    });
  });

  it("rejects malformed provider responses", () => {
    expect(() =>
      parseLatestTrack(
        { recenttracks: { track: [{ name: "Incomplete" }] } },
        "err53",
      ),
    ).toThrow("unexpected response");
  });

  it("rejects explicit provider errors", () => {
    expect(() =>
      parseLatestTrack({ error: 10, message: "Invalid API key" }, "err53"),
    ).toThrow("Invalid API key");
  });

  it("returns null when the user has no listening history", () => {
    expect(
      parseLatestTrack({ recenttracks: { track: [] } }, "err53"),
    ).toBeNull();
  });
});
