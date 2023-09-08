import { useLastFM } from "use-last-fm";
import TinyCrossfade from "react-tiny-crossfade";

export const CurrentlyPlaying = () => {
  const lastFM = useLastFM(
    "err53",
    import.meta.env.PUBLIC_LASTFM_API_KEY,
    undefined,
    "medium"
  );

  return (
    <a href={lastFM?.song?.url || ""}>
      <TinyCrossfade
        classNames={{
          beforeEnter: "opacity-0",
          entering: "opacity-1 transition-opacity duration-500",
          beforeLeave: "opacity-1",
          leaving: "opacity-0 transition-opacity duration-500",
        }}
        className="flex h-full border shadow-md hover:bg-slate-50 active:bg-slate-100 active:shadow-none transition-height duration-500 overflow-hidden"
      >
        {lastFM.status !== "playing" ? (
          <p key="notplaying" className="p-4 my-auto">
            Not listening to anything...
          </p>
        ) : (
          <div key={lastFM.song.url} className="flex flex-row">
            <img
              src={lastFM.song.art}
              alt={`The album art for ${lastFM.song.album}`}
              width="64px"
              height="64px"
              className="my-auto lg:w-20"
            />
            <p className="px-4 my-auto">
              Listening to <i>{lastFM.song.name}</i> by{" "}
              <i>{lastFM.song.artist}</i>
            </p>
          </div>
        )}
      </TinyCrossfade>
    </a>
  );
};
