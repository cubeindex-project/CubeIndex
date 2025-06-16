import type { PageServerLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";
import { error } from "@sveltejs/kit";

export const load = (async () => {
  const { data: cubes, error: err } = await supabase
    .from("cube_models")
    .select("*")
    .order("series", { ascending: true })
    .order("model", { ascending: true });

  if (err) throw error(500, err.message);

  return { cubes };
}) satisfies PageServerLoad;
