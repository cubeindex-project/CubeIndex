import type { PageLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";
import { clientLogError } from "$lib/logger/clientLogError";
import { clientLogger } from "$lib/logger/client";

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

  if (ucErr) {
    return clientLogError(
      "Unable to load user cubes",
      clientLogger,
      ucErr
    );
  }
  if (uaErr) {
    return clientLogError(
      "Unable to load user achievements",
      clientLogger,
      uaErr
    );
  }
  if (urErr) {
    return clientLogError(
      "Unable to load user ratings",
      clientLogger,
      urErr
    );
  }

  const main_cubes = user_cubes.filter((uc) => uc.main === true);

  return {
    main_cubes,
    user_cubes,
    user_achievements,
    user_cube_ratings,
  };
}) satisfies PageLoad;
