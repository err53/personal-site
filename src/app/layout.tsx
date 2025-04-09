import "~/styles/globals.css";

import type { Metadata } from "next";

import { Footer } from "./_components/Footer";

import { PostHogProvider } from "./providers";
import { TRPCReactProvider } from "~/trpc/react";

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
      <body>
        <TRPCReactProvider>
          <PostHogProvider>
            {children}
            <Footer />
          </PostHogProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
