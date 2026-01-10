import type { PageServerLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";
import type {
  DetailedCube,
  DetailedUserCubeReview,
} from "$lib/components/dbTableTypes";
import { logError } from "$lib/server/logError";

interface UserReviewWithCube extends DetailedUserCubeReview {
  cube_model: Pick<DetailedCube, "slug" | "name" | "image_url">;
}

export const load = (async ({ parent, locals: { log } }) => {
  const { profile } = await parent();

  const { data: reviewsRaw, error: reviewErr } = await supabase
    .from("v_detailed_user_cube_reviews")
    .select("*, cube_model:v_detailed_cube_models(slug, name, image_url)")
    .eq("user_id", profile.user_id)
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  if (reviewErr) {
    logError(500, "Failed to fetch user reviews", log, reviewErr);
  }

  return { reviews: reviewsRaw as UserReviewWithCube[] };
}) satisfies PageServerLoad;
