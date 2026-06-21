import type { PageServerLoad } from "./$types";
import { logError } from "$lib/server/logError";
import type { Tables } from "$lib/types/database.types";

interface DetailedUserCubeReviewWithProfile extends Tables<"v_detailed_user_cube_reviews"> {
  profile: Pick<
    Tables<"profiles">,
    "username" | "display_name" | "profile_picture"
  >;
}

export const load = (async ({ locals: { supabase, log }, parent, params }) => {
  const { cube, meta } = await parent();
  const { slug } = params;

  const { data: reviewRaw, error: rErr } = await supabase
    .from("v_detailed_user_cube_reviews")
    .select("*, profile:user_id(username, display_name, profile_picture)")
    .eq("cube", slug)
    .eq("status", "published")
    .order("helpful_count", { ascending: false })
    .order("updated_at", { ascending: false });

  if (rErr) {
    return logError(500, "Failed to load cube reviews", log, rErr);
  }

  return {
    cube,
    reviews: reviewRaw as DetailedUserCubeReviewWithProfile[],
    meta: {
      ...meta,
      title: `${cube.name} - Reviews`,
      noindex: true,
    },
  };
}) satisfies PageServerLoad;
