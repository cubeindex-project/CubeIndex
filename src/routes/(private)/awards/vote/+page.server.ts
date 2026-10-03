import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { Tables } from "$lib/types/database.types";

export const load = (async ({ locals: { supabase, log }, parent }) => {
  const { currentEvent } = await parent();

  let eventCategories: Tables<"awards_category">[] = [];

  if (currentEvent) {
    const { data, error: acErr } = await supabase
      .from("awards_category")
      .select("*")
      .eq("event_id", currentEvent.id);

    if (acErr) {
      log.error({ err: acErr }, "Failed to fetch the current event categories");
      throw error(500, "Failed to fetch the current event categories");
    }

    eventCategories = data.sort((a, b) => a.name.localeCompare(b.name));
  }

  return {
    eventCategories,
    meta: {
      title: "Awards Voting - CubeIndex",
      noindex: true,
    },
  };
}) satisfies PageServerLoad;
