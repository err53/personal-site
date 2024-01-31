import Image from "next/image";
import { Card, CardHeader } from "./ui/Card";

import personal_site from "@/app/assets/personal_site.png";
import dash_banner from "@/app/assets/dash_banner.png";
import dh_portal from "@/app/assets/dh_portal.png";
import salesbop from "@/app/assets/salesbop.png";
import cs_wiki from "@/app/assets/cs_wiki.png";
import oscs from "@/app/assets/oscs.png";

const projectSizes = "(min-width: 640px) 50vw, 100vw";

export const Projects = () => (
  <div className="col-span-full">
    <h2 className="text-3xl font-semibold">Projects</h2>
    <div className="grid grid-cols-1 gap-4 py-3 md:grid-cols-2">
      <Card href="https://github.com/err53/personal-site">
        <CardHeader>
          <h3 className="text-2xl">Personal Site</h3>
          <p>You&apos;re looking at it right now!</p>
        </CardHeader>
        <Image
          src={personal_site}
          alt="A screenshot of this website."
          sizes={projectSizes}
          style={{
            width: "100%",
            height: "auto",
          }}
          loading="eager"
          priority
        />
      </Card>

      <Card href="https://github.com/Krish120003/dash">
        <CardHeader>
          <h3 className="text-2xl">Dash</h3>
          <p>A personalizable new-tab dashboard</p>
        </CardHeader>
        <Image
          src={dash_banner}
          alt="A screenshot of Dash."
          sizes={projectSizes}
          style={{
            width: "100%",
            height: "auto",
          }}
          loading="eager"
          priority
        />
      </Card>

      <Card href="https://github.com/deltahacks/portal">
        <CardHeader>
          <h3 className="text-2xl">DeltaHacks Portal</h3>
          <p>A hackathon registration and management system</p>
        </CardHeader>
        <Image
          src={dh_portal}
          alt="A screenshot of the DeltaHacks portal."
          sizes={projectSizes}
          style={{
            width: "100%",
            height: "auto",
          }}
        />
      </Card>

      <Card href="https://www.salesbop.io">
        <CardHeader>
          <h3 className="text-2xl">SalesBop</h3>
          <p>An up-and-coming AI sales coaching app</p>
        </CardHeader>
        <Image
          src={salesbop}
          alt="A screenshot of the SalesBop landing page."
          sizes={projectSizes}
          style={{
            width: "100%",
            height: "auto",
          }}
        />
      </Card>

      <Card href="https://wiki.egirls.dev">
        <CardHeader>
          <h3 className="text-2xl">McMaster CS Wiki</h3>
          <p>A repository of course knowledge, notes, and resources</p>
        </CardHeader>
        <Image
          src={cs_wiki}
          alt="A screenshot of the McMaster CS Wiki."
          sizes={projectSizes}
          style={{
            width: "100%",
            height: "auto",
          }}
        />
      </Card>

      <Card href="https://github.com/mac-egirls/oscs">
        <CardHeader>
          <h3 className="text-2xl">Open Source Cheat Sheets</h3>
          <p>
            A collection of community-built, freely modifiable course cheat
            sheets
          </p>
        </CardHeader>
        <Image
          src={oscs}
          alt="A screenshot of the Open Source Cheat Sheets preview page."
          sizes={projectSizes}
          style={{
            width: "100%",
            height: "auto",
          }}
        />
      </Card>
    </div>
  </div>
);
