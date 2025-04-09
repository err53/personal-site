import { HydrateClient, api } from "~/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { LastFM, LastFMLoading, LastFMError } from "./_components/LastFM";
import { Hero } from "./_components/Hero";
import { Socials } from "./_components/Socials";
import { Resume } from "./_components/Resume";
import { Projects } from "./_components/Projects";

export default async function Home() {
  void api.lastfm.getLatestTrack.prefetch({ user: "err53" });

  return (
    <main className="container mx-auto grid max-w-6xl grid-cols-1 items-baseline gap-4 px-4 md:grid-cols-2">
      <Hero />
      <Socials />
      <Resume />
      <Projects />
      <HydrateClient>
        <ErrorBoundary FallbackComponent={LastFMError}>
          <Suspense fallback={<LastFMLoading />}>
            <LastFM />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </main>
  );
}
