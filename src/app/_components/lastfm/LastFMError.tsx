import { FaCircleExclamation } from "react-icons/fa6";

export const LastFMError = async ({
  user,
  message,
}: {
  user: string;
  message: string;
}) => {
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
