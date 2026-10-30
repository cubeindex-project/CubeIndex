import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({
  locals: { log, supabase, user },
  parent,
  params,
}) => {
  const startedAt = performance.now();

  if (!user) {
    log.warn(
      { event: "awards.ballot.unauthorized" },
      "Unauthorized awards ballot access",
    );
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
      {
        event: "awards.ballot.category_failed",
        errorCode: ccErr.code,
        eventID: currentEvent.id,
        year: currentEvent.year,
      },
      "An error occured while fetching the current event category",
    );
    throw error(
      500,
      "An error occured while fetching the current event category",
    );
  }

  if (!currentCategory) {
    log.warn(
      {
        event: "awards.ballot.category_not_found",
        eventID: currentEvent.id,
        year: currentEvent.year,
      },
      "This category doesn't exist",
    );
    throw error(404, "This category doesn't exist");
  }

  const { data: nominees, error: anErr } = await supabase
    .from("awards_nominee")
    .select("*, cube:v_detailed_cube_models(*)")
    .eq("category_id", currentCategory.id);

  if (anErr) {
    log.error(
      {
        event: "awards.ballot.nominees_failed",
        errorCode: anErr.code,
        eventID: currentEvent.id,
        categoryID: currentCategory.id,
        year: currentEvent.year,
      },
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
      {
        event: "awards.ballot.user_vote_failed",
        errorCode: auvErr.code,
        eventID: currentEvent.id,
        categoryID: currentCategory.id,
        year: currentEvent.year,
      },
      "An error occured while fetching the user vote for the current category",
    );
    throw error(
      500,
      "An error occured while fetching the user vote for the current category",
    );
  }

  log.info(
    {
      event: "awards.ballot.loaded",
      eventID: currentEvent.id,
      categoryID: currentCategory.id,
      year: currentEvent.year,
      nomineeCount: nominees.length,
      durationMs: performance.now() - startedAt,
    },
    "Loaded awards ballot",
  );

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
