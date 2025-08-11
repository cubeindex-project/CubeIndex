import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, parent }) => {
  const data = await parent();

  const { data: user_cubes, error: ucErr } = await locals.supabase
    .from("user_cubes")
    .select(`*, cube_model:cube_models(*)`)
    .eq("user_id", data.profile.user_id);

  if (ucErr) throw error(500, ucErr.message);

  const main_cubes = user_cubes.filter((uc) => uc.main === true);

  const { data: user_achievements, error: uaErr } = await locals.supabase
    .from("user_achievements")
    .select("*")
    .eq("user_id", data.profile.user_id);

  if (uaErr) throw error(500, uaErr.message);

  const { data: user_cube_ratings, error: urErr } = await locals.supabase
    .from("user_cube_ratings")
    .select("*")
    .eq("user_id", data.profile.user_id);

  if (urErr) {
    throw error(500, `Failed to fetch user ratings: ${urErr.message}`);
  }

  return {
    main_cubes,
    user_cubes,
    user_achievements,
    user_cube_ratings,
  };
}) satisfies PageServerLoad;
