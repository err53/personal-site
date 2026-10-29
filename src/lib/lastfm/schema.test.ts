import { describe, expect, it } from "vitest";

import {
  getPlayHistory,
  type LatestTrack,
  normalizeTrack,
  parseLatestTrack,
  parseRecentTracks,
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
      thumbnailUrl: "https://example.com/large.jpg",
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

describe("parseRecentTracks", () => {
  it("normalizes every track in order", () => {
    const tracks = parseRecentTracks(
      {
        recenttracks: {
          track: [
            { ...baseTrack, "@attr": { nowplaying: "true" }, date: undefined },
            { ...baseTrack, name: "Angel" },
          ],
        },
      },
      "err53",
    );

    expect(tracks.map(({ name, nowPlaying }) => ({ name, nowPlaying }))).toEqual([
      { name: "Teardrop", nowPlaying: true },
      { name: "Angel", nowPlaying: false },
    ]);
  });
});

describe("getPlayHistory", () => {
  const play = (
    name: string,
    playedAt: string | null,
    nowPlaying = false,
  ): LatestTrack => ({
    name,
    artist: "Artist",
    album: "",
    imageUrl: null,
    thumbnailUrl: null,
    trackUrl: `https://www.last.fm/music/Artist/_/${name}`,
    profileUrl: "https://www.last.fm/user/err53",
    nowPlaying,
    playedAt,
  });

  const a = play("A", "2024-08-19T20:10:00.000Z");
  const b = play("B", "2024-08-19T20:05:00.000Z");
  const c = play("C", "2024-08-19T20:00:00.000Z");

  it("removes the play the card is showing, wherever it is", () => {
    expect(getPlayHistory([b, a, c], a)).toEqual([b, c]);
  });

  it("keeps every finished play when the card shows something not in the list", () => {
    expect(getPlayHistory([a, b, c], play("D", "2024-08-19T20:15:00.000Z"))).toEqual([
      a,
      b,
      c,
    ]);
  });

  it("drops the now-playing entry and its early scrobble", () => {
    const playing = play("A", null, true);
    expect(getPlayHistory([playing, a, b, c], playing)).toEqual([b, c]);
  });

  it("drops a now-playing entry even before the card has loaded", () => {
    expect(getPlayHistory([play("A", null, true), b, c], null)).toEqual([b, c]);
  });
});
