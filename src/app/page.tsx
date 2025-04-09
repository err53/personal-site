import { LastFM } from "./_components/lastfm";
import { Hero } from "./_components/Hero";
import { Socials } from "./_components/Socials";
import { Resume } from "./_components/Resume";
import { Projects } from "./_components/Projects";

export default async function Home() {
  const lastfmUser = "err53";

  return (
    <main className="container mx-auto grid max-w-6xl grid-cols-1 items-baseline gap-4 px-4 md:grid-cols-2">
      <Hero />
      <Socials />
      <Resume />
      <Projects />

      <LastFM user={lastfmUser} />
    </main>
  );
}
