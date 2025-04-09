"use client";

import { FaCircleExclamation } from "react-icons/fa6";
import {
  motion,
  type AnimationScope,
  useAnimate,
  useMotionValue,
  useWillChange,
} from "framer-motion";
import { useEffect, useCallback } from "react";
import Image from "next/image";
import { api } from "~/trpc/react";
import type { FallbackProps } from "react-error-boundary";

const user = "err53";

export const LastFMLoading = () => (
  <div>
    <h2 className="pb-3 text-3xl font-semibold">LastFM</h2>
    <a
      href={`https://www.last.fm/user/${user}`}
      aria-label="Last.fm Profile"
      className="hover:bg-accent hover:text-accent-foreground flex h-full flex-row gap-2 border p-2 shadow-md transition-all duration-300 active:shadow-none"
    >
      <div className="h-16 w-16 animate-pulse rounded-full bg-slate-200" />
      <div className="my-auto flex animate-pulse flex-col gap-3">
        <div className="h-3 w-28 rounded bg-slate-200" />
        <div className="h-3 w-60 rounded bg-slate-200" />
      </div>
    </a>
  </div>
);

export const LastFMError = ({ error }: FallbackProps) => {
  let message = "Unknown error";
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else if (typeof error === "object" && error !== null) {
    message = JSON.stringify(error);
  }

  return (
    <div>
      <h2 className="pb-3 text-3xl font-semibold">LastFM</h2>
      <a
        href={`https://www.last.fm/user/${user}`}
        aria-label="Last.fm Profile"
        className="hover:bg-accent hover:text-accent-foreground flex h-full flex-row gap-2 border p-2 shadow-md transition-all duration-300 active:shadow-none"
      >
        <FaCircleExclamation className="h-16 w-16 rounded-full bg-slate-200" />
        <div className="my-auto flex flex-col gap-3">Error: {message}</div>
      </a>
    </div>
  );
};

export const LastFM = () => {
  const [data] = api.lastfm.getLatestTrack.useSuspenseQuery(
    { user },
    {
      refetchInterval: 1 * 1000, // 5s
    },
  );
  const [scope, animate] = useAnimate();
  const rotate = useMotionValue(0);
  const willChange = useWillChange();

  const recordAnimation = useCallback(
    async (s: AnimationScope<unknown>, isNowPlaying: boolean) => {
      if (isNowPlaying) {
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
      const isNowPlaying = "@attr" in data && data["@attr"]?.nowplaying;
      void recordAnimation(scope, Boolean(isNowPlaying));
    }
  }, [data, recordAnimation, scope]);

  // Get album image
  const albumImage =
    data?.image.find((img) => img.size === "large")?.["#text"] ?? "";
  // Get track and artist
  const trackName = data?.name;
  const artistName = data?.artist["#text"];

  // Check if track is now playing
  const isNowPlaying = data && "@attr" in data && data["@attr"].nowplaying;

  return (
    <div>
      <h2 className="pb-3 text-3xl font-semibold">LastFM</h2>
      <a
        href={`https://www.last.fm/user/${user}`}
        aria-label="Last.fm Profile"
        className="hover:bg-accent hover:text-accent-foreground flex h-full flex-row gap-2 border p-2 shadow-md transition-all duration-300 active:shadow-none"
      >
        <motion.div
          ref={scope}
          style={{ willChange, rotate, flex: "none", alignSelf: "center" }}
        >
          <Image
            src={albumImage}
            alt={`Album art for ${data?.album?.["#text"] ?? "album"}`}
            width={64}
            height={64}
            className={"h-16 w-16 rounded-full"}
            unoptimized
          />
        </motion.div>
        {isNowPlaying ? (
          <>
            <p className="my-auto">
              Listening to:
              <br />
              <i>{trackName}</i> by <i>{artistName}</i>
            </p>
          </>
        ) : (
          <>
            <p className="my-auto">
              Last listened to:
              <br />
              <i>{trackName}</i> by <i>{artistName}</i>
            </p>
          </>
        )}
      </a>
    </div>
  );
};
