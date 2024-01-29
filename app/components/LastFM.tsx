"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import getLatestTrack from "../lib/getLatestTrack";

export default function LastFM(props: { user: string }) {
  const { user } = props;
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["user.getrecenttracks", user, "&limit=1"],
    queryFn: getLatestTrack,
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
        artist: track.artist["#text"],
        url: track.url,
        images: track.image.reduce(
          (prev, cur) => ({
            ...prev,
            [cur.size]: cur["#text"],
          }),
          {},
        ) as {
          small: string;
          medium: string;
          large: string;
          extralarge: string;
        },
      };
    },
    refetchInterval: 5000,
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
      className="hover:bg-accent hover:text-accent-foreground flex h-full flex-row gap-2 border p-2 shadow-md active:shadow-none"
    >
      {data.nowPlaying ? (
        <>
          <Image
            src={data.images.large}
            alt={`Album art for ${data.album}`}
            width={64}
            height={64}
            className="animate-spin-slow h-16 w-16 rounded-full"
          />
          <p className="my-auto">
            Listening to:
            <br />
            <i>{data.name}</i> by <i>{data.artist}</i>
          </p>
        </>
      ) : (
        <>
          <Image
            src={data.images.large}
            alt={`Album art for ${data.album}`}
            width={64}
            height={64}
            className="h-16 w-16 rounded-full"
          />
          <p className="my-auto">
            Last listened to:
            <br />
            <i>{data.name}</i> by <i>{data.artist}</i>
          </p>
        </>
      )}
    </a>
  );
}
