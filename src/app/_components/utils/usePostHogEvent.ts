import { usePostHog } from "posthog-js/react";

/**
 * A custom hook for tracking events with PostHog
 * @param eventName The name of the event to track
 * @param properties Optional properties to include with the event
 * @returns A function that can be called to track the event
 */
export const usePostHogEvent = (
  eventName: string,
  properties?: Record<string, string | number | boolean | null>,
) => {
  const posthog = usePostHog();

  return () => {
    if (posthog) {
      posthog.capture(eventName, properties);
    }
  };
};
