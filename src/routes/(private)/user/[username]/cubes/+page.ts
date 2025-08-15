import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";

export const load = (async ({ parent }) => {
  const { profile } = await parent();

  const [
    { data: user_cubes, error: userCubesError },
    { data: user_cube_ratings, error: userRatingsError },
  ] = await Promise.all([
    supabase
      .from("user_cubes")
      .select("*, cube_model:cube(*)")
      .eq("user_id", profile.user_id),
    supabase
      .from("user_cube_ratings")
      .select("*")
      .eq("user_id", profile.user_id),
  ]);

  if (userCubesError)
    throw error(
      500,
      `Failed to fetch the user cubes: ${userCubesError.message}`
    );
  if (userRatingsError)
    throw error(
      500,
      `Failed to fetch user ratings: ${userRatingsError.message}`
    );

  return { user_cubes, user_cube_ratings };
}) satisfies PageLoad;
