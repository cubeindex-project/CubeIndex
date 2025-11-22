import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals: { supabase, log } }) => {
  const { data: current_event, error: aeErr } = await supabase
    .from("awards_event")
    .select("*")
    .gt("end_at", new Date().toISOString())
    .maybeSingle();

  if (aeErr) {
    log.error({ err: aeErr }, "Failed to fetch current event");
    throw error(500, "Failed to fetch current event");
  }
  return { current_event };
}) satisfies LayoutServerLoad;
