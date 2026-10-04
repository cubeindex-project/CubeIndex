import { PUBLIC_UMAMI_WEBSITE_ID } from "$env/static/public";
import { Umami, type UmamiEventData } from "@umami/node";

/** Sends an opt-in server-side Umami event without affecting the request outcome. */
export async function trackServerEvent(
  eventName: string,
  data?: UmamiEventData,
): Promise<void> {
  if (!PUBLIC_UMAMI_WEBSITE_ID) return;

  const umami = new Umami({
    hostUrl: "https://cloud.umami.is",
    websiteId: PUBLIC_UMAMI_WEBSITE_ID,
  });

  try {
    if (data) {
      await umami.track(eventName, data);
    } else {
      await umami.track(eventName);
    }
  } catch {
    // Analytics must not affect the route that triggered it.
  }
}
