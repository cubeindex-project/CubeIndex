import { logError } from "$lib/server/logError";
import type { PageServerLoad } from "./$types";

export const load = (async ({ parent, locals: { supabase, log } }) => {
  const { profile } = await parent();

  const { data: user_cube_ratings, error: urErr } = await supabase
    .from("user_cube_ratings")
    .select(
      "*, cube_model:cube_slug(*), profile:user_id(username, display_name)",
    )
    .eq("user_id", profile.user_id);

  if (urErr) {
    logError(
      500,
      "An error occurred while fetching user cube ratings",
      log,
      urErr,
    );
  }

  return {
    user_cube_ratings,
    meta: {
      title: `${profile.display_name}'s Ratings - CubeIndex`,
      description: `View ${profile.display_name}'s ratings on CubeIndex. See which cubes they have scored and how their ratings compare across different puzzles.`,
    },
  };
}) satisfies PageServerLoad;
