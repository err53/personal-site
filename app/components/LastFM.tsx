"use client";

import { useQuery } from "@tanstack/react-query";
import getLatestTrack from "../lib/getLatestTrack";
import { FaCircleExclamation } from "react-icons/fa6";
import {
  motion,
  AnimationScope,
  useAnimate,
  useMotionValue,
  useWillChange,
} from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import "./lastfm.css";

export const LastFM: React.FC<{ user: string }> = ({ user }) => (
  <div>
    <h2 className="pb-3 text-3xl font-semibold">LastFM</h2>
    <LastFMCard user={user} />
  </div>
);

const LastFMCard: React.FC<{ user: string }> = ({ user }) => {
  const [scope, animate] = useAnimate();
  const rotate = useMotionValue(0);
  const willChange = useWillChange();

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

  const recordAnimation = useCallback(
    async (s: AnimationScope<any>, nowPlaying: boolean) => {
      if (nowPlaying) {
        // spin up the record
        rotate.set(-360);
        await animate(
          s.current,
          { rotate: 0 },
          { ease: "easeIn", duration: 3 },
        );

        // continue spinning the record
        rotate.set(-360);
        await animate(
          s.current,
          { rotate: 0 },
          { ease: "linear", duration: 1.8, repeat: Infinity },
        );
      } else {
        // spin down the record
        animate(
          s.current,
          { rotate: 0 },
          { type: "spring", duration: 7, bounce: 0 },
        );
      }
    },
    [animate, rotate],
  );

  useEffect(() => {
    if (data) {
      void recordAnimation(scope, data?.nowPlaying);
    }
  }, [data, recordAnimation, scope]);

  if (isPending) {
    return (
      <a
        href={`https://www.last.fm/user/${user}`}
        aria-label="Last.fm Profile"
        className="flex h-full flex-row gap-2 border p-2 shadow-md transition-all duration-300 hover:bg-accent hover:text-accent-foreground active:shadow-none"
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
        className="flex h-full flex-row gap-2 border p-2 shadow-md transition-all duration-300 hover:bg-accent hover:text-accent-foreground active:shadow-none"
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
      className="flex h-full flex-row gap-2 border p-2 shadow-md transition-all duration-300 hover:bg-accent hover:text-accent-foreground active:shadow-none"
    >
      <motion.div
        ref={scope}
        style={{ willChange, rotate, flex: "none", alignSelf: "center" }}
      >
        <Image
          src={data.images.large}
          alt={`Album art for ${data.album}`}
          width={64}
          height={64}
          className={"h-16 w-16 rounded-full"}
          unoptimized
        />
      </motion.div>
      {data.nowPlaying ? (
        <>
          <p className="my-auto">
            Listening to:
            <br />
            <i>{data.name}</i> by <i>{data.artist}</i>
          </p>
        </>
      ) : (
        <>
          <p className="my-auto">
            Last listened to:
            <br />
            <i>{data.name}</i> by <i>{data.artist}</i>
          </p>
        </>
      )}
    </a>
  );
};
