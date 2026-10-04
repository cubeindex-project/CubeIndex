import type { EventData } from "$lib/types/umami.types";

/** Sends a browser analytics event when the Umami tracker is available. */
export function trackEvent(eventName: string, data?: EventData): void {
  if (typeof window === "undefined" || !window.umami?.track) return;

  const trackingRequest = data
    ? window.umami.track(eventName, data)
    : window.umami.track(eventName);
  void trackingRequest.catch(() => undefined);
}

/** Associates the current Umami session with the authenticated user. */
export function identifyVisitor(userID: string, data?: EventData): void {
  if (typeof window === "undefined" || !window.umami?.identify) return;

  void window.umami.identify(userID, data).catch(() => undefined);
}
