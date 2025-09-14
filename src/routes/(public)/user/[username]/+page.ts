import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";

export const load = (async ({ parent }) => {
  const { profile } = await parent();

  const [
    { data: user_cubes, error: ucErr },
    { data: user_achievements, error: uaErr },
    { data: user_cube_ratings, error: urErr },
  ] = await Promise.all([
    supabase
      .from("user_cubes")
      .select(`*, cube_model:cube_models(*), vendor:bought_from(name)`)
      .eq("user_id", profile.user_id),
    supabase
      .from("user_achievements")
      .select("*, achievement:achievement_slug(*)")
      .eq("user_id", profile.user_id),
    supabase
      .from("user_cube_ratings")
      .select("*, cube_model:cube_models(*)")
      .eq("user_id", profile.user_id),
  ]);

  if (ucErr) throw error(500, ucErr.message);
  if (uaErr) throw error(500, uaErr.message);
  if (urErr) {
    throw error(500, `Failed to fetch user ratings: ${urErr.message}`);
  }

  const main_cubes = user_cubes.filter((uc) => uc.main === true);

  return {
    main_cubes,
    user_cubes,
    user_achievements,
    user_cube_ratings,
  };
}) satisfies PageLoad;
