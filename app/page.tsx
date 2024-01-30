import LastFM from "./components/LastFM";
import { Hero } from "./components/Hero";
import { Socials } from "./components/Socials";
import { Resume } from "./components/Resume";
import { Projects } from "./components/Projects";

export const runtime = "edge";

export default async function Home() {
  const user = "err53";

  return (
    <main className="container grid grid-cols-1 items-baseline gap-4 md:grid-cols-2">
      <Hero />
      <Socials />
      <Resume />
      <Projects />
      <LastFM user={user} />
    </main>
  );
}
