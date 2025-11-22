import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals: { log, supabase }, parent, params }) => {
  const current_event = (await parent()).current_event;
  const current_category = params.category;

  const { data: awards_category, error: acErr } = await supabase
    .from("awards_category")
    .select("*")
    .eq("event_id", current_event.id)
    .eq("slug", current_category)
    .maybeSingle();

  if (acErr) {
    log.error(
      { err: acErr },
      "An error occured while fetching the current event category"
    );
    throw error(
      500,
      "An error occured while fetching the current event category"
    );
  }

  if (!awards_category) {
    log.error("This category doesn't exist");
    throw error(404, "This category doesn't exist");
  }

  const { data: awards_nominee_raw, error: anErr } = await supabase
    .from("awards_nominee")
    .select("cube:v_detailed_cube_models(*)")
    .eq("category_id", awards_category.id);

  if (anErr) {
    log.error(
      { err: anErr },
      "An error occured while fetching nominees for the current category"
    );
    throw error(
      500,
      "An error occured while fetching nominees for the current category"
    );
  }

  const awards_nominee = awards_nominee_raw.map((an) => an.cube);

  return { current_event, awards_category, awards_nominee };
}) satisfies PageServerLoad;
