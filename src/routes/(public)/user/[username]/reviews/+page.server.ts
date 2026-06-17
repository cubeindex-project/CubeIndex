import type { PageServerLoad } from "./$types";
import type { Tables } from "$lib/types/database.types";
import { logError } from "$lib/server/logError";

export const load = (async ({ parent, locals: { log, supabase } }) => {
  const { profile } = await parent();

  const { data: userReviews, error: reviewErr } = await supabase
    .from("v_detailed_user_cube_reviews")
    .select("*, cube_model:v_detailed_cube_models(slug, name, image_url)")
    .eq("user_id", profile.user_id)
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  if (reviewErr) {
    logError(500, "Failed to fetch user reviews", log, reviewErr);
  }

  return {
    userReviews,
    meta: {
      title: `${profile.display_name}'s Reviews - CubeIndex`,
      description: `View ${profile.display_name}'s reviews on CubeIndex. Read their detailed feedback on cubes they have tried, including what they liked, what they did not, and any setup notes they shared.`,
    },
  };
}) satisfies PageServerLoad;
