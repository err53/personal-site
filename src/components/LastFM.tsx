import { useLastFM } from "use-last-fm";

export const CurrentlyPlaying = () => {
  const lastFM = useLastFM(
    "err53",
    import.meta.env.PUBLIC_LASTFM_API_KEY,
    undefined,
    "medium"
  );

  if (lastFM.status !== "playing") {
    return (
      <div className="flex h-full flex-row border shadow-md group-hover:bg-slate-50 group-active:bg-slate-100 group-active:shadow-none">
        <p className="p-4 my-auto">Not listening to anything...</p>
      </div>
    );
  }

  return (
    <a href={lastFM.song.url}>
      <div className="flex h-full flex-row border shadow-md group-hover:bg-slate-50 group-active:bg-slate-100 group-active:shadow-none">
        <img src={lastFM.song.art} className="my-auto lg:w-20" />
        <p className="px-4 my-auto">
          Listening to <i>{lastFM.song.name}</i> by <i>{lastFM.song.artist}</i>
        </p>
      </div>
    </a>
  );
};
