import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import LastFM from "./components/LastFM";
import getLatestTrack from "./lib/getLatestTrack";

export const runtime = "edge";

export default async function Home() {
  const queryClient = new QueryClient();
  const user = "err53";

  await queryClient.prefetchQuery({
    queryKey: ["user.getrecenttracks", user, "&limit=1"],
    queryFn: getLatestTrack,
  });

  return (
    <main className="">
      Hello World! Vercel plz deploy...
      <HydrationBoundary state={dehydrate(queryClient)}>
        <LastFM user={user} />
      </HydrationBoundary>
    </main>
  );
}
