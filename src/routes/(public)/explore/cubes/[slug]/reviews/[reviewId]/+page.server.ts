import type { PageServerLoad } from "./$types";
import { logError } from "$lib/server/logError";
import { error } from "@sveltejs/kit";
import type {
  DetailedUserCubeReview,
  Profiles,
} from "$lib/components/dbTableTypes";

interface DetailedUserCubeReviewWithProfile extends DetailedUserCubeReview {
  profile: Pick<Profiles, "username" | "display_name" | "profile_picture">;
}

export const load = (async ({
  locals: { supabase, log, user },
  parent,
  params,
}) => {
  const { cube } = await parent();
  const { reviewId, slug } = params;

  const { data: reviewRaw, error: rErr } = await supabase
    .from("v_detailed_user_cube_reviews")
    .select(
      "id, title, review, created_at, updated_at, ratings, helpful_count, profile:user_id(username, display_name, profile_picture)",
    )
    .eq("id", reviewId)
    .eq("cube", slug)
    .eq("status", "published")
    .maybeSingle();

  if (rErr) {
    return logError(500, `Failed to load cube review ${reviewId}`, log, rErr);
  }

  if (!reviewRaw) throw error(404, "Review not found for this cube");

  let isHelpful = false;

  if (user) {
    const { count, error } = await supabase
      .from("helpful_review")
      .select("*", { head: true, count: "exact" })
      .eq("user_id", user.id)
      .eq("review_id", reviewId);

    if (error) {
      return logError(
        500,
        "Failed to determine whether the user marked this review as helpful",
        log,
        error,
      );
    }

    isHelpful = (count ?? 0) > 0;
  }

  return {
    cube,
    review: reviewRaw as DetailedUserCubeReviewWithProfile,
    isHelpful,
  };
}) satisfies PageServerLoad;
