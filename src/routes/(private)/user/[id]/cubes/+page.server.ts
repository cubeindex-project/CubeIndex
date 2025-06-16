import type { PageServerLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";
import { error } from "@sveltejs/kit";

export const load = (async ({ parent }) => {
  const { profile } = await parent();

  const { data: user_cubes, error: userCubesError } = await supabase
    .from("user_cubes")
    .select("*")
    .eq("username", profile.username);

  if (userCubesError) throw error(500, userCubesError.message);

  const { data: cubes, error: cubesErr } = await supabase
    .from("cube_models")
    .select("*");

  if (cubesErr) throw error(500, cubesErr.message);

  return { user_cubes, cubes };
}) satisfies PageServerLoad;
