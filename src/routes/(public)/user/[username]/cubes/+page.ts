import type { PageLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";
import { clientLogError } from "$lib/logger/clientLogError";
import { clientLogger } from "$lib/logger/client";

export const load = (async ({ parent }) => {
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
    return clientLogError(
      "Unable to load user cubes",
      clientLogger,
      userCubesError
    );
  }
  if (userRatingsError) {
    return clientLogError(
      "Unable to load user ratings",
      clientLogger,
      userRatingsError
    );
  }

  return { user_cubes, user_cube_ratings };
}) satisfies PageLoad;
