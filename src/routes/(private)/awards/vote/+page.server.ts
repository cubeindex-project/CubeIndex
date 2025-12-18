import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { AwardsCategory } from "$lib/components/dbTableTypes";

export const load = (async ({ locals: { supabase, log }, parent }) => {
  const current_event = (await parent()).current_event;

  let awards_category: AwardsCategory[] = [];

  if (current_event) {
    const { data, error: acErr } = await supabase
      .from("awards_category")
      .select("*")
      .eq("event_id", current_event.id);

    if (acErr) {
      log.error({ err: acErr }, "Failed to fetch the current event categories");
      throw error(500, "Failed to fetch the current event categories");
    }

    awards_category = data.sort((a, b) => a.name.localeCompare(b.name));
  }

  return { awards_category };
}) satisfies PageServerLoad;
