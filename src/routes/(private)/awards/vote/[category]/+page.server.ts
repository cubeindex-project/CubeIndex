import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({
  locals: { log, supabase, user },
  parent,
  params,
}) => {
  if (!user) {
    throw error(401, "Unauthorized");
  }

  const { currentEvent } = await parent();
  const currentCategorySlug = params.category;

  const { data: currentCategory, error: ccErr } = await supabase
    .from("awards_category")
    .select("*")
    .eq("event_id", currentEvent.id)
    .eq("slug", currentCategorySlug)
    .maybeSingle();

  if (ccErr) {
    log.error(
      { err: ccErr },
      "An error occured while fetching the current event category",
    );
    throw error(
      500,
      "An error occured while fetching the current event category",
    );
  }

  if (!currentCategory) {
    log.error("This category doesn't exist");
    throw error(404, "This category doesn't exist");
  }

  const { data: nominees, error: anErr } = await supabase
    .from("awards_nominee")
    .select("*, cube:v_detailed_cube_models(*)")
    .eq("category_id", currentCategory.id);

  if (anErr) {
    log.error(
      { err: anErr },
      "An error occured while fetching nominees for the current category",
    );
    throw error(
      500,
      "An error occured while fetching nominees for the current category",
    );
  }

  const { data: userVote, error: auvErr } = await supabase
    .from("awards_user_vote")
    .select("*")
    .eq("user_id", user.id)
    .eq("category_id", currentCategory.id)
    .maybeSingle();

  if (auvErr) {
    log.error(
      { err: auvErr },
      "An error occured while fetching the user vote for the current category",
    );
    throw error(
      500,
      "An error occured while fetching the user vote for the current category",
    );
  }

  return {
    currentCategory,
    nominees,
    userVote,
    meta: {
      title: `${currentCategory.name} - Awards Ballot`,
      noindex: true,
    },
  };
}) satisfies PageServerLoad;
