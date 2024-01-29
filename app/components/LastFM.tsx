"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { z } from "zod";

const trackSchema = z.object({
  artist: z.object({
    mbid: z.string(),
    "#text": z.string(),
  }),
  streamable: z.string(),
  image: z.array(
    z.object({
      size: z.enum(["small", "medium", "large", "extralarge"]),
      "#text": z.string().url(),
    })
  ),
  mbid: z.string(),
  album: z.object({
    mbid: z.string(),
    "#text": z.string(),
  }),
  name: z.string(),
  url: z.string().url(),
});

const nowPlayingTrackSchema = trackSchema.merge(
  z.object({
    "@attr": z.object({
      nowplaying: z.literal(true),
    }),
  })
);

const pastTrackSchema = trackSchema.merge(
  z.object({
    date: z.object({
      uts: z.coerce.number(),
      "#text": z.coerce.date(),
    }),
  })
);

const getrecenttracksSchema = z.object({
  recenttracks: z.object({
    track: z.array(z.union([nowPlayingTrackSchema, pastTrackSchema])),
    "@attr": z.object({
      user: z.string(),
      totalPages: z.coerce.number(),
      page: z.coerce.number(),
      perPage: z.coerce.number(),
      total: z.coerce.number(),
    }),
  }),
});

export const getrecenttracksQuery = async ({
  queryKey,
}: {
  queryKey: string[];
}) => {
  const [_, user, params] = queryKey;
  const response = await fetch(
    "https://ws.audioscrobbler.com/2.0/?format=json&method=user.getrecenttracks" +
      `&user=${user}` +
      `&api_key=${process.env.NEXT_PUBLIC_LASTFM_API_KEY}` +
      params
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return getrecenttracksSchema.parse(data);
};

export default function LastFM(props: { user: string }) {
  const { user } = props;
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["user.getrecenttracks", user, "&limit=1"],
    queryFn: getrecenttracksQuery,
    select: (data) => {
      const nowPlaying =
        "@attr" in data.recenttracks.track?.[0] &&
        data.recenttracks.track?.[0]["@attr"].nowplaying;
      const track = data.recenttracks.track?.[0];
      return {
        nowPlaying,
        scrobbles: data.recenttracks["@attr"].total,
        name: track.name,
        album: track.album["#text"],
        artist: track.artist,
        url: track.url,
        images: track.image.reduce(
          (prev, cur) => ({
            ...prev,
            [cur.size]: cur["#text"],
          }),
          {}
        ) as {
          small: string;
          medium: string;
          large: string;
          extralarge: string;
        },
      };
    },
  });

  if (isPending) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <a
      href={`https://www.last.fm/user/${user}`}
      aria-label="Last.fm Profile"
      className="flex h-full flex-row gap-2 border p-2 shadow-md hover:bg-accent hover:text-accent-foreground active:shadow-none"
    >
      {data.nowPlaying ? (
        <>
          <Image
            src={data.images.large}
            alt={`Album art for ${data.album}`}
            width={64}
            height={64}
            className={"animate-spin-slow h-16 w-16 rounded-full"}
          />
          {data}
        </>
      ) : (
        <>{data}</>
      )}
    </a>
  );
}
