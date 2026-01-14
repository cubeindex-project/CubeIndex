import type { PageServerLoad } from "./$types";
import { logError } from "$lib/server/logError";

export const load = (async ({ parent, locals: { supabase, log } }) => {
  const { profile } = await parent();

  const [
    { data: user_cubes, error: userCubesError },
    { data: user_cube_ratings, error: userRatingsError },
  ] = await Promise.all([
    supabase
      .from("user_cubes")
      .select("*, cube_model:cube(*), bought_from, vendor:bought_from(name)")
      .eq("user_id", profile.user_id),
    supabase
      .from("user_cube_ratings")
      .select("*")
      .eq("user_id", profile.user_id),
  ]);

  if (userCubesError) {
    return logError(500, "Unable to load user cubes", log, userCubesError);
  }
  if (userRatingsError) {
    return logError(500, "Unable to load user ratings", log, userRatingsError);
  }

  return {
    user_cubes,
    user_cube_ratings,
    meta: { title: `${profile.display_name}'s Cube Collection - CubeIndex` },
  };
}) satisfies PageServerLoad;
