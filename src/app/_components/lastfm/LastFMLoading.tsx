export const LastFMLoading = ({ user }: { user: string }) => (
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
