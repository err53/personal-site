import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import LastFM from "./components/LastFM";
import getLatestTrack from "./lib/getLatestTrack";
import { Hero } from "./components/Hero";
import { Socials } from "./components/Socials";
import { Resume } from "./components/Resume";
import { Projects } from "./components/Projects";

export const runtime = "edge";

export default async function Home() {
  const queryClient = new QueryClient();
  const user = "err53";

  await queryClient.prefetchQuery({
    queryKey: ["user.getrecenttracks", user, "&limit=1"],
    queryFn: getLatestTrack,
  });

  return (
    <main className="container grid grid-cols-1 items-baseline gap-4 md:grid-cols-2">
      <Hero />
      <Socials />
      <Resume />
      <Projects />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <LastFM user={user} />
      </HydrationBoundary>
    </main>
  );
}
