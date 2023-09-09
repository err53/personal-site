import { useLastFM } from "use-last-fm";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export const CurrentlyPlaying = () => {
  const lastFM = useLastFM(
    "err53",
    import.meta.env.PUBLIC_LASTFM_API_KEY,
    undefined,
    "medium"
  );

  const [parent] = useAutoAnimate();

  return (
    <a href={lastFM.status == "playing" ? lastFM.song.url : undefined}>
      <div
        ref={parent}
        className="flex h-full flex-row border shadow-md group-hover:bg-slate-50 group-active:bg-slate-100 group-active:shadow-none"
      >
        {lastFM.status == "playing" && (
          <img src={lastFM.song.art} className="my-auto lg:w-20 animate-pulse-slow" />
        )}
        {lastFM.status == "playing" ? (
          <p className="px-4 py-2 my-auto">
            Listening to <i>{lastFM.song.name}</i> by{" "}
            <i>{lastFM.song.artist}</i>
          </p>
        ) : (
          <p className="px-4 py-2 my-auto">Not listening to anything...</p>
        )}
      </div>
    </a>
  );
};
