import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals: { supabase, log } }) => {
  const now = new Date().toISOString();

  const res = await supabase
    .from("awards_event")
    .select("*")
    .lte("start_at", now)
    .gte("end_at", now)
    .maybeSingle();
  let current_event = res.data;
  const currentErr = res.error;

  if (currentErr) {
    log.error({ err: currentErr }, "Failed to fetch current event");
    throw error(500, "Failed to fetch current event");
  }

  if (!current_event) {
    const { data: next_event, error: nextErr } = await supabase
      .from("awards_event")
      .select("*")
      .gt("start_at", now)
      .order("start_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (nextErr) {
      log.error({ err: nextErr }, "Failed to fetch next event");
      throw error(500, "Failed to fetch next event");
    }

    current_event = next_event;
  }

  return { current_event };
}) satisfies LayoutServerLoad;
