import { useLastFM } from "use-last-fm";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export const CurrentlyPlaying = () => {
  const lastFM = useLastFM(
    "err53",
    import.meta.env.PUBLIC_LASTFM_API_KEY,
    undefined,
    "medium",
  );

  const [parent] = useAutoAnimate();

  return (
    <a href="https://www.last.fm/user/err53">
      <div
        ref={parent}
        className="flex h-full flex-row border shadow-md hover:bg-slate-50 active:bg-slate-100 active:shadow-none"
      >
        {lastFM.status == "playing" && (
          <img
            src={lastFM.song.art}
            className="my-auto animate-pulse-slow lg:w-20"
          />
        )}
        {lastFM.status == "playing" ? (
          <p className="my-auto px-4 py-2">
            Listening to <i>{lastFM.song.name}</i> by{" "}
            <i>{lastFM.song.artist}</i>
          </p>
        ) : (
          <p className="my-auto px-4 py-2">Not listening to anything...</p>
        )}
      </div>
    </a>
  );
};
