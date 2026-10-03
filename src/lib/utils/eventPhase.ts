import type { Tables } from "$lib/types/database.types";

export type EventPhase = "upcoming" | "live" | "past" | "unknown";

export const getEventPhase = (
  event: Pick<Tables<"awards_event">, "start_at" | "end_at"> | null,
  now = new Date(),
): EventPhase => {
  if (!event) return "unknown";

  const startMs = new Date(event.start_at).getTime();
  const endMs = new Date(event.end_at).getTime();
  const nowMs = now.getTime();

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
    return "unknown";
  }
  if (nowMs < startMs) return "upcoming";
  if (nowMs <= endMs) return "live";
  return "past";
};
