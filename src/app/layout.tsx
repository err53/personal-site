import "~/styles/globals.css";

import type { Metadata } from "next";
import Providers from "./providers";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Footer } from "./_components/Footer";
import PostHogPageView from "./_components/PostHogPageView";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Jason Huang",
  description: "Personal Site",
  verification: {
    google: "dTPtm5dSnc1vpyvOWE7Y21OhVMZW7gMFOC8gGRAGTlc",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Providers>
        <body>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          {children}
          <ReactQueryDevtools />
          <Footer />
        </body>
      </Providers>
    </html>
  );
}
