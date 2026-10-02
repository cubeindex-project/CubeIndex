import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ parent, locals: { supabase, log } }) => {
  const { profile, meta, canViewProfile } = await parent();

  if (!canViewProfile) {
    return {
      user_cubes: [],
      user_cube_ratings: [],
      meta: {
        ...meta,
        title: `${profile.display_name}'s Cube Collection - CubeIndex`,
      },
    };
  }

  const [
    { data: user_cubes, error: userCubesError },
    { data: user_cube_ratings, error: userRatingsError },
  ] = await Promise.all([
    supabase
      .from("user_cubes")
      .select(
        "*, cube_model:v_detailed_cube_models(*), bought_from_id, vendor:bought_from_id(name)",
      )
      .eq("user_id", profile.user_id),
    supabase
      .from("user_cube_ratings")
      .select("*")
      .eq("user_id", profile.user_id),
  ]);

  if (userCubesError) {
    log.error({ err: userCubesError }, "Unable to load user cubes");
    throw error(500, "Unable to load user cubes");
  }
  if (userRatingsError) {
    log.error({ err: userRatingsError }, "Unable to load user ratings");
    throw error(500, "Unable to load user ratings");
  }

  const { data: vendors, error: err } = await supabase
    .from("vendors")
    .select("id, slug, name")
    .order("name", { ascending: true });

  if (err) {
    log.error({ err }, "Failed to load vendors");
    throw error(500, "Failed to load vendors");
  }

  return {
    vendors,
    user_cubes,
    user_cube_ratings,
    meta: {
      ...meta,
      title: `${profile.display_name}'s Cube Collection - CubeIndex`,
    },
  };
}) satisfies PageServerLoad;
