import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({
  locals: { log, supabase, user },
  parent,
  params,
}) => {
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
    .select("*, cube:v_detailed_cube_models(*)")
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

  const awards_nominee = awards_nominee_raw.map((an) => {
    return { ...an.cube, nominee_id: an.id };
  });

  let user_vote: number | null = null;

  if (user) {
    const { data, error: auvErr } = await supabase
      .from("awards_user_vote")
      .select("*")
      .eq("user_id", user.id)
      .eq("category_id", awards_category.id)
      .maybeSingle();

    if (auvErr) {
      log.error(
        { err: auvErr },
        "An error occured while fetching the user vote for the current category"
      );
      throw error(
        500,
        "An error occured while fetching the user vote for the current category"
      );
    }

    user_vote = data?.nominee_id ?? null;
  }

  return { awards_category, awards_nominee, user_vote };
}) satisfies PageServerLoad;
