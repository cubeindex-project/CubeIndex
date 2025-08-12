import type { PageLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";

export const load = (async ({ parent }) => {
  const data = await parent();

  const { data: user_cube_ratings, error: urErr } = await supabase
    .from("user_cube_ratings")
    .select("*, cube_model:cube_slug(*), profile:user_id(username, display_name)")
    .eq("user_id", data.profile.user_id);

  if (urErr) {
    console.error(`Failed to fetch user ratings: ${urErr.message}`);
    return;
  }

  console.log(user_cube_ratings);

  return { user_cube_ratings };
}) satisfies PageLoad;
