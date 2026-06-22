import type { PageLoad } from "./$types";

export const load = (async ({ parent }) => {
  const { supabase } = await parent();
  const { data: user_cube_ratings, error: urErr } = await supabase
    .from("user_cube_ratings")
    .select("*, cube_slug:v_detailed_cube_models!cube_slug(*), user_id(*)");

  if (urErr) {
    throw new Error(`Failed to fetch user ratings: ${urErr.message}`);
  }
  return { user_cube_ratings };
}) satisfies PageLoad;
