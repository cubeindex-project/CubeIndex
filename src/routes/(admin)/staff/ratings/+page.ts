import type { PageLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";

export const load = (async () => {
  const { data: user_cube_ratings, error: urErr } = await supabase
    .from("user_cube_ratings")
    .select("*, cube_slug(*), user_id(*)");

  if (urErr) {
    throw new Error(`Failed to fetch user ratings: ${urErr.message}`);
  }
  return { user_cube_ratings };
}) satisfies PageLoad;
