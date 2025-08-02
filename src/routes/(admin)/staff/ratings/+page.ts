import type { PageLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";

export const load = (async () => {
  const { data: user_cube_ratings, error: urErr } = await supabase
    .from("user_cube_ratings")
    .select("*");

  if (urErr) {
    throw new Error(`Failed to fetch user ratings: ${urErr.message}`);
    return;
  }
  
  const { data: cubes, error: cErr } = await supabase
    .from("cube_models")
    .select("*")
    .order("model", { ascending: true })
    .order("series", { ascending: true });

  if (cErr) {
    throw new Error("A 500 status code error occured:" + cErr.message);
    return;
  }
  return { user_cube_ratings, cubes };
}) satisfies PageLoad;
