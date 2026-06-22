import { logError } from "$lib/server/logError";
import type { PageServerLoad } from "./$types";

export const load = (async ({ parent, locals: { supabase, log } }) => {
  const { profile, meta, canViewProfile } = await parent();

  if (!canViewProfile) {
    return {
      user_cube_ratings: [],
      meta: {
        ...meta,
        title: `${profile.display_name}'s Ratings - CubeIndex`,
        noindex: true,
      },
    };
  }

  const { data: user_cube_ratings, error: urErr } = await supabase
    .from("user_cube_ratings")
    .select(
      "*, cube_model:v_detailed_cube_models!cube_slug(*), profile:user_id(username, display_name)",
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
      ...meta,
      title: `${profile.display_name}'s Ratings - CubeIndex`,
      noindex: true,
    },
  };
}) satisfies PageServerLoad;
