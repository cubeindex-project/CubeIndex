import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals: { supabase, log } }) => {
  const now = new Date().toISOString();

  const { data: fetchedCurrentEvent, error: currentEventErr } = await supabase
    .from("awards_event")
    .select("*")
    .lte("start_at", now)
    .gte("end_at", now)
    .maybeSingle();
  let currentEvent = fetchedCurrentEvent;

  if (currentEventErr) {
    log.error({ err: currentEventErr }, "Failed to fetch current event");
    throw error(500, "Failed to fetch current event");
  }

  if (!currentEvent) {
    const { data: nextEvent, error: nextEventErr } = await supabase
      .from("awards_event")
      .select("*")
      .gt("start_at", now)
      .order("start_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (nextEventErr) {
      log.error({ err: nextEventErr }, "Failed to fetch next event");
      throw error(500, "Failed to fetch next event");
    }

    currentEvent = nextEvent;
  }

  return { currentEvent };
}) satisfies LayoutServerLoad;
