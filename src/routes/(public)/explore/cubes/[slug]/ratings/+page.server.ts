import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ parent, locals: { supabase, log } }) => {
  const { cube, meta } = await parent();

  const ratingsPromise = supabase
    .from("user_cube_ratings")
    .select("*, profile:user_id(username, display_name)")
    .eq("cube_id", cube.id);

  const [ratingsRes] = await Promise.all([ratingsPromise]);

  if (ratingsRes.error) {
    log.error({ err: ratingsRes.error }, "Unable to load cube ratings");
    throw error(500, "Unable to load cube ratings");
  }

  return {
    cube,
    user_cube_ratings: ratingsRes.data ?? [],
    meta: {
      ...meta,
      title: `${cube.name} - Ratings`,
      noindex: true,
    },
  };
}) satisfies PageServerLoad;
