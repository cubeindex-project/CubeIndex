import type { AwardsEvent } from "../dbTableTypes";

type EventPhase = "upcoming" | "live" | "past" | "unknown";

export const getEventPhase = (event: Pick<AwardsEvent, "start_at" | "end_at">): EventPhase => {
  const startMs = new Date(event.start_at).getTime();
  const endMs = new Date(event.end_at).getTime();
  const nowMs = Date.now();

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
    return "unknown";
  }
  if (nowMs < startMs) return "upcoming";
  if (nowMs <= endMs) return "live";
  return "past";
};
