import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals: { supabase, log } }) => {
  const startedAt = performance.now();
  const now = new Date().toISOString();

  const { data: currentEvent, error: currentEventErr } = await supabase
    .from("awards_event")
    .select("*")
    .lte("start_at", now)
    .gte("end_at", now)
    .order("start_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (currentEventErr) {
    log.error(
      {
        event: "awards.layout.current_event_failed",
        errorCode: currentEventErr.code,
      },
      "Failed to fetch current event",
    );
    throw error(500, "Failed to fetch current event");
  }

  if (!currentEvent) {
    log.warn(
      { event: "awards.layout.no_active_event" },
      "No awards event is currently active",
    );
    throw error(404, "No event is currently active");
  }

  log.info(
    {
      event: "awards.layout.loaded",
      eventID: currentEvent.id,
      year: currentEvent.year,
      durationMs: performance.now() - startedAt,
    },
    "Loaded active awards event",
  );

  return { currentEvent };
}) satisfies LayoutServerLoad;
