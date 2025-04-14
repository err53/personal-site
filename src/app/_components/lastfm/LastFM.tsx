"use client";

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
import { usePostHogEvent } from "../../_components/utils/usePostHogEvent";

import { LastFMLoading } from "./LastFMLoading";
import { LastFMError } from "./LastFMError";

export const LastFM = ({ user }: { user: string }) => {
  const { data, isLoading, isError, error } =
    api.lastfm.getLatestTrack.useQuery(
      { user },
      {
        refetchInterval: 1 * 1000, // 5s
      },
    );
  const [scope, animate] = useAnimate();
  const rotate = useMotionValue(0);
  const willChange = useWillChange();

  // Get track and artist early to use in the event tracking
  const trackName = data?.name ?? "";
  const artistName = data?.artist?.["#text"] ?? "";
  const isNowPlaying = Boolean(
    data && "@attr" in data && data["@attr"]?.nowplaying,
  );

  const trackProfileClick = usePostHogEvent("lastfm_profile_clicked", {
    track: trackName,
    artist: artistName,
  });

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
      void recordAnimation(scope, isNowPlaying);
    }
  }, [data, recordAnimation, scope, isNowPlaying]);

  if (isLoading) {
    return <LastFMLoading user={user} />;
  }

  if (isError) {
    return <LastFMError user={user} message={error.message} />;
  }

  if (!data) {
    return <LastFMError user={user} message="No data" />;
  }

  // Get album image
  const imageSizes = {
    small: data.image.find((img) => img.size === "small")?.["#text"],
    medium: data.image.find((img) => img.size === "medium")?.["#text"],
    large: data.image.find((img) => img.size === "large")?.["#text"],
    extraLarge: data.image.find((img) => img.size === "extralarge")?.["#text"],
  };

  const srcImage =
    imageSizes.extraLarge ??
    imageSizes.large ??
    imageSizes.medium ??
    imageSizes.small ??
    "";

  return (
    <div>
      <h2 className="pb-3 text-3xl font-semibold">LastFM</h2>
      <a
        href={`https://www.last.fm/user/${user}`}
        aria-label="Last.fm Profile"
        onClick={trackProfileClick}
        className="hover:bg-accent hover:text-accent-foreground flex h-full flex-row gap-2 border p-2 shadow-md transition-all duration-300 active:shadow-none"
      >
        <motion.div
          ref={scope}
          style={{ willChange, rotate, flex: "none", alignSelf: "center" }}
        >
          <Image
            src={srcImage}
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
