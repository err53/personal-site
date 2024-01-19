import React, { useState, useEffect } from "react";

enum imageSize {
  small = "small",
  medium = "medium",
  large = "large",
  extralarge = "extralarge",
}

type UserGetRecentTracks = {
  recenttracks: {
    track: [
      {
        artist: {
          mbid: string;
          "#text": string;
        };
        streamable: string;
        image: [
          {
            size: imageSize;
            "#text": string;
          },
        ];
        mbid: string;
        album: {
          mbid: string;
          "#text": string;
        };
        name: string;
        "@attr"?: {
          nowplaying: boolean;
        };
        url: string;
        date?: {
          uts: string;
          "#text": string;
        };
      },
    ];
    "@attr": {
      user: string;
      totalPages: string;
      page: string;
      perPage: string;
      total: string;
    };
  };
};

type UserGetRecentTracksError = {
  message: string;
  error: number;
};

const getLastFMImage = (lastFM: { data: UserGetRecentTracks }) => {
  let src = lastFM.data.recenttracks.track[0].image.find(
    (i) => i.size === imageSize.medium,
  )["#text"];
  if (!src) {
    src = lastFM.data.recenttracks.track[0].image.find(
      (i) => i.size === imageSize.large,
    )["#text"];
  }
  if (!src) {
    src = lastFM.data.recenttracks.track[0].image.find(
      (i) => i.size === imageSize.extralarge,
    )["#text"];
  }
  return src;
};

export const LastFM = ({ user }) => {
  const [lastFM, setLastFM] = useState<
    | {
        status: "success";
        data: UserGetRecentTracks;
      }
    | { status: "failed"; data: UserGetRecentTracksError }
    | { status: "loading" }
  >({ status: "loading" });

  useEffect(
    () => {
      const initialFetch = async () => {
        const data = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${user}&api_key=${
            import.meta.env.PUBLIC_LASTFM_API_KEY
          }&format=json&limit=1`,
        );

        if (data.ok) {
          setLastFM({ status: "success", data: await data.json() });
        } else {
          setLastFM({ status: "failed", data: await data.json() });
        }
      };

      initialFetch();

      // setup continuous data refetching
      const interval = setInterval(
        async () => {
          const data = await fetch(
            `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${user}&api_key=${
              import.meta.env.PUBLIC_LASTFM_API_KEY
            }&format=json&limit=1`,
          );

          if (data.ok) {
            setLastFM({ status: "success", data: await data.json() });
          } else {
            setLastFM({ status: "failed", data: await data.json() });
          }
        },
        // rerun query every 5 seconds
        1000 * 5,
      );
      return () => clearInterval(interval);
    },
    // only run once on load
    [],
  );

  return (
    <a
      href="https://www.last.fm/user/err53"
      aria-label="Last.fm Profile"
      className="flex h-full flex-row gap-2 border p-2 shadow-md hover:bg-accent hover:text-accent-foreground active:shadow-none"
    >
      {lastFM.status === "success" ? (
        lastFM.data.recenttracks.track[0]?.["@attr"]?.nowplaying ? (
          // currently playing music
          <>
            <img
              src={getLastFMImage(lastFM)}
              width={64}
              height={64}
              className={"animate-spin-slow h-16 w-16 rounded-full"}
            />
            <p className="my-auto">
              Listening to:
              <br />
              <i>{lastFM.data.recenttracks.track[0].name}</i> by{" "}
              <i>{lastFM.data.recenttracks.track[0].artist["#text"]}</i>
            </p>
          </>
        ) : (
          <>
            <img
              src={getLastFMImage(lastFM)}
              width={64}
              height={64}
              className={`h-16 w-16 rounded-full`}
            />
            <p className="my-auto">
              Last listened to:
              <br />
              <i>{lastFM.data.recenttracks.track[0].name}</i> by{" "}
              <i>{lastFM.data.recenttracks.track[0].artist["#text"]}</i>
            </p>
          </>
        )
      ) : (
        <>
          <div className="h-16 w-16 rounded-full bg-slate-200" />
          <div className="my-auto flex flex-col gap-3">
            <div className="h-3 w-36 rounded bg-slate-200" />
            <div className="h-3 w-44 rounded bg-slate-200" />
          </div>
        </>
      )}
    </a>
  );
};

type LastFMProps = {
  user: string;
};
