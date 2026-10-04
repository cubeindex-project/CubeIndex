import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals: { supabase, log, user }, parent }) => {
  if (!user) {
    throw error(401, "Unauthorized");
  }

  const { currentEvent } = await parent();

  const { data: eventCategories, error: acErr } = await supabase
    .from("awards_category")
    .select("*")
    .eq("event_id", currentEvent.id)
    .order("name", { ascending: true });

  if (acErr) {
    log.error({ err: acErr }, "Failed to fetch the current event categories");
    throw error(500, "Failed to fetch the current event categories");
  }

  const { data: currentUserVotes, error: auvErr } = await supabase
    .from("awards_user_vote")
    .select("*")
    .eq("user_id", user.id)
    .in(
      "category_id",
      eventCategories.map((category) => category.id),
    );

  if (auvErr) {
    log.error({ err: auvErr }, "Failed to fetch the user votes");
    throw error(500, "Failed to fetch the user votes");
  }

  return {
    eventCategories: eventCategories.map((category) => ({
      ...category,
      alreadyVoted: currentUserVotes.some(
        (userVote) => userVote.category_id === category.id,
      ),
    })),
    meta: {
      title: "Awards Voting - CubeIndex",
      noindex: true,
    },
  };
}) satisfies PageServerLoad;
