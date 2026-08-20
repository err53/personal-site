import type { APIRoute } from "astro";

export const prerender = false;

const RESUME_URL =
  "https://github.com/err53/resume/releases/latest/download/resume.pdf";
const REQUEST_TIMEOUT_MS = 10_000;

const forwardedRequestHeaders = [
  "if-modified-since",
  "if-none-match",
  "if-range",
  "range",
];
const forwardedResponseHeaders = [
  "accept-ranges",
  "content-length",
  "content-range",
  "etag",
  "last-modified",
];

const proxyResume = (async ({ request }) => {
  try {
    const requestHeaders = new Headers({ Accept: "application/pdf" });
    for (const name of forwardedRequestHeaders) {
      const value = request.headers.get(name);
      if (value) requestHeaders.set(name, value);
    }

    const upstream = await fetch(RESUME_URL, {
      method: request.method === "HEAD" ? "HEAD" : "GET",
      headers: requestHeaders,
      redirect: "follow",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!upstream.ok && upstream.status !== 304) {
      throw new Error(`Resume release returned HTTP ${upstream.status}`);
    }

    const responseHeaders = new Headers({
      "Cache-Control": request.headers.has("range")
        ? "public, max-age=600"
        : "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Disposition": 'inline; filename="Jason-Huang-Resume.pdf"',
      "Content-Type": "application/pdf",
    });

    for (const name of forwardedResponseHeaders) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Failed to fetch resume release", error);

    return new Response("Resume is temporarily unavailable.", {
      status: 502,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}) satisfies APIRoute;

export const GET = proxyResume;
export const HEAD = proxyResume;
