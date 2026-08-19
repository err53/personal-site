import type { LatestTrack } from "./schema";

type LastFmResponse = {
  track: LatestTrack | null;
};

type LastFmElements = {
  root: HTMLElement;
  endpoint: string;
  card: HTMLAnchorElement;
  image: HTMLImageElement;
  placeholder: HTMLElement;
  status: HTMLElement;
  trackName: HTMLElement;
  artist: HTMLElement;
  refreshError: HTMLElement;
};

const POLL_INTERVAL_MS = 10_000;

function getElements(root: HTMLElement): LastFmElements | null {
  const endpoint = root.dataset.endpoint;
  const card = root.querySelector<HTMLAnchorElement>("[data-card]");
  const image = root.querySelector<HTMLImageElement>("[data-image]");
  const placeholder = root.querySelector<HTMLElement>("[data-placeholder]");
  const status = root.querySelector<HTMLElement>("[data-status]");
  const trackName = root.querySelector<HTMLElement>("[data-track]");
  const artist = root.querySelector<HTMLElement>("[data-artist]");
  const refreshError = root.querySelector<HTMLElement>("[data-refresh-error]");

  if (
    !endpoint ||
    !card ||
    !image ||
    !placeholder ||
    !status ||
    !trackName ||
    !artist ||
    !refreshError
  ) return null;

  return {
    root,
    endpoint,
    card,
    image,
    placeholder,
    status,
    trackName,
    artist,
    refreshError,
  };
}

function renderTrack(elements: LastFmElements, track: LatestTrack) {
  const {
    root,
    card,
    image,
    placeholder,
    status,
    trackName,
    artist,
    refreshError,
  } = elements;

  root.dataset.playing = String(track.nowPlaying);
  card.href = track.profileUrl;
  status.textContent = track.nowPlaying ? "Listening to:" : "Last listened to:";
  trackName.textContent = track.name;
  artist.textContent = `by ${track.artist}`;
  artist.classList.remove("hidden");
  refreshError.classList.add("hidden");

  if (track.imageUrl) {
    image.src = track.imageUrl;
    image.alt = track.album
      ? `${track.album} album cover`
      : `${track.name} album cover`;
    image.classList.remove("hidden");
    placeholder.classList.add("hidden");
  } else {
    image.removeAttribute("src");
    image.classList.add("hidden");
    placeholder.classList.remove("hidden");
  }
}

function renderEmpty(elements: LastFmElements) {
  elements.root.dataset.playing = "false";
  elements.status.textContent = "No recent tracks found.";
  elements.trackName.textContent = "Visit my Last.fm profile";
  elements.artist.classList.add("hidden");
  elements.refreshError.classList.add("hidden");
  elements.image.classList.add("hidden");
  elements.placeholder.classList.remove("hidden");
}

function renderError(elements: LastFmElements, hasTrack: boolean) {
  if (hasTrack) {
    elements.refreshError.classList.remove("hidden");
    return;
  }

  elements.root.dataset.playing = "false";
  elements.status.textContent = "Last.fm is unavailable.";
  elements.trackName.textContent = "Visit my Last.fm profile";
  elements.artist.classList.add("hidden");
}

function initializeRoot(elements: LastFmElements) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let controller: AbortController | undefined;
  let hasTrack = false;

  const scheduleNext = () => {
    window.clearTimeout(timer);
    if (!document.hidden) timer = window.setTimeout(refresh, POLL_INTERVAL_MS);
  };

  const refresh = async () => {
    controller?.abort();
    const requestController = new AbortController();
    controller = requestController;

    try {
      const response = await fetch(elements.endpoint, {
        headers: { Accept: "application/json" },
        signal: requestController.signal,
      });
      if (!response.ok) throw new Error(`Request failed with ${response.status}`);

      const data = (await response.json()) as LastFmResponse;
      hasTrack = Boolean(data.track);
      if (data.track) renderTrack(elements, data.track);
      else renderEmpty(elements);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        renderError(elements, hasTrack);
      }
    } finally {
      if (controller === requestController) scheduleNext();
    }
  };

  document.addEventListener("visibilitychange", () => {
    window.clearTimeout(timer);
    if (document.hidden) controller?.abort();
    else void refresh();
  });

  void refresh();
}

export function initializeLastFm() {
  document.querySelectorAll<HTMLElement>("[data-lastfm]").forEach((root) => {
    if (root.dataset.initialized === "true") return;
    root.dataset.initialized = "true";

    const elements = getElements(root);
    if (elements) initializeRoot(elements);
  });
}
