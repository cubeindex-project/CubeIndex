import type { PageLoad } from "./$types";
import { clientLogError } from "$lib/logger/clientLogError";
import { clientLogger } from "$lib/logger/client";

export const load = (async ({ parent, params }) => {
  const { supabase, cube } = await parent();
  const { slug } = params;

  const ratingsPromise = supabase
    .from("user_cube_ratings")
    .select("*, profile:user_id(username, display_name)")
    .eq("cube_slug", slug);

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
  };
}) satisfies PageLoad;
