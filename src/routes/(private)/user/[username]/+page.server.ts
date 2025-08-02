import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {
  const { data: user_cubes, error: ucErr } = await locals.supabase
    .from("user_cubes")
    .select(`*, cube_models(*)`)
    .eq("user_id", locals.user?.id);

  if (ucErr) throw error(500, ucErr.message);

  const main_cubes = user_cubes
    .filter((uc) => uc.main === true)
    .map((mc) => {
      const cube = mc.cube_models;
      return cube;
    });

  const { data: user_achievements, error: uaErr } = await locals.supabase
    .from("user_achievements")
    .select("*")
    .eq("user_id", locals.user?.id);

  if (uaErr) throw error(500, uaErr.message);

  return { main_cubes, user_cubes, user_achievements };
}) satisfies PageServerLoad;
