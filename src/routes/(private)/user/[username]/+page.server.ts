import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {
  const { data: user_cubes, error: mcErr } = await locals.supabase
    .from("user_cubes")
    .select(`cube_models(*)`)
    .eq("user_id", locals.user?.id)
    .eq("main", true);

  if (mcErr) throw error(500, mcErr.message);

  const main_cubes = user_cubes.map((mc) => {
    const cube = mc.cube_models;
    return cube;
  });

  return { main_cubes };
}) satisfies PageServerLoad;
