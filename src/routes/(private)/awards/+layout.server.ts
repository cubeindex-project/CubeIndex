import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals: { supabase, log } }) => {
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
    log.error({ err: currentEventErr }, "Failed to fetch current event");
    throw error(500, "Failed to fetch current event");
  }

  if (!currentEvent) {
    throw error(404, "No event are currently active");
  }

  return { currentEvent };
}) satisfies LayoutServerLoad;
