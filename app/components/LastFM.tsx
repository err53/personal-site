"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import getLatestTrack from "../lib/getLatestTrack";
import { FaCircleExclamation } from "react-icons/fa6";

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
          {}
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
    return (
      <a
        href={`https://www.last.fm/user/${user}`}
        aria-label="Last.fm Profile"
        className="hover:bg-accent hover:text-accent-foreground flex h-full flex-row gap-2 border p-2 shadow-md active:shadow-none"
      >
        <div className="h-16 w-16 animate-pulse rounded-full bg-slate-200" />
        <div className="my-auto flex animate-pulse flex-col gap-3">
          <div className="h-3 w-28 rounded bg-slate-200" />
          <div className="h-3 w-60 rounded bg-slate-200" />
        </div>
      </a>
    );
  }

  if (isError) {
    return (
      <a
        href={`https://www.last.fm/user/${user}`}
        aria-label="Last.fm Profile"
        className="hover:bg-accent hover:text-accent-foreground flex h-full flex-row gap-2 border p-2 shadow-md active:shadow-none"
      >
        <FaCircleExclamation className="h-16 w-16 rounded-full bg-slate-200" />
        <div className="my-auto flex flex-col gap-3">
          Error: {error.message}
        </div>
      </a>
    );
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
            className="animate-spin-record h-16 w-16 rounded-full"
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
