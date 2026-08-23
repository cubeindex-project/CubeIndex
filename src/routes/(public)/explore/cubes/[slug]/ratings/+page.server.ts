import type { PageServerLoad } from "./$types";
import { clientLogError } from "$lib/logger/clientLogError";
import { clientLogger } from "$lib/logger/client";

export const load = (async ({ parent, locals: { supabase } }) => {
  const { cube, meta } = await parent();

  const ratingsPromise = supabase
    .from("user_cube_ratings")
    .select("*, profile:user_id(username, display_name)")
    .eq("cube_id", cube.id);

  const [ratingsRes] = await Promise.all([ratingsPromise]);

  if (ratingsRes.error) {
    return clientLogError(
      "Unable to load cube ratings",
      clientLogger,
      ratingsRes.error,
    );
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
