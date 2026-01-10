import type { PageServerLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";
import { logError } from "$lib/server/logError";

export const load = (async ({ parent, locals: { log } }) => {
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

  if (ucErr) {
    return logError(500, "Unable to load user cubes", log, ucErr);
  }
  if (uaErr) {
    return logError(500, "Unable to load user achievements", log, uaErr);
  }
  if (urErr) {
    return logError(500, "Unable to load user ratings", log, urErr);
  }

  const main_cubes = user_cubes.filter((uc) => uc.main === true);

  return {
    main_cubes,
    user_cubes,
    user_achievements,
    user_cube_ratings,
  };
}) satisfies PageServerLoad;
