import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import LastFM, { getrecenttracksQuery } from "./components/LastFM";

export default async function Home() {
  const queryClient = new QueryClient();
  const user = "err53";

  await queryClient.prefetchQuery({
    queryKey: ["user.getrecenttracks", user, "&limit=1"],
    queryFn: getrecenttracksQuery,
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
