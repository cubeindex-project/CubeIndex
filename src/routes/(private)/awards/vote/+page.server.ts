import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals: { supabase, log }, parent }) => {
  const current_event = (await parent()).current_event;

  const { data: awards_category, error: acErr } = await supabase
    .from("awards_category")
    .select("*")
    .eq("event_id", current_event.id);

  if (acErr) {
    log.error({ err: acErr }, "Failed to fetch the current event categories");
    throw error(500, "Failed to fetch the current event categories");
  }

  return { awards_category };
}) satisfies PageServerLoad;
