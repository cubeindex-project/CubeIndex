import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

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

  if (!current_event) {
    return { current_event: null, awards_category: [], previous_events: [] };
  }

  const { data: awards_category, error: acErr } = await supabase
    .from("awards_category")
    .select("*")
    .eq("event_id", current_event.id);

  if (acErr) {
    log.error({ err: acErr }, "Failed to fetch the current event categories");
    throw error(500, "Failed to fetch the current event categories");
  }

  const {
    data: previous_events,
    error: prevErr,
  } = await supabase
    .from("awards_event")
    .select("*")
    .lt("year", current_event.year)
    .order("year", { ascending: false });

  if (prevErr) {
    log.error({ err: prevErr }, "Failed to fetch previous awards events");
    throw error(500, "Failed to fetch previous awards events");
  }

  return { current_event, awards_category, previous_events };
}) satisfies PageServerLoad;
