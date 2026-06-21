import type { PageServerLoad } from "./$types";
import { logError } from "$lib/server/logError";
import { error } from "@sveltejs/kit";

export const load = (async ({
  locals: { supabase, log, user },
  parent,
  params,
}) => {
  const { cube, meta } = await parent();
  const { reviewId, slug } = params;

  const reviewIdNumber = Number(reviewId);

  const { data: review, error: rErr } = await supabase
    .from("v_detailed_user_cube_reviews")
    .select(
      "id, title, review, created_at, updated_at, ratings, helpful_count, profile:user_id(username, display_name, profile_picture)",
    )
    .eq("id", reviewIdNumber)
    .eq("cube", slug)
    .eq("status", "published")
    .maybeSingle();

  if (rErr) {
    return logError(500, `Failed to load cube review ${reviewId}`, log, rErr);
  }

  if (!review) throw error(404, "Review not found for this cube");

  let isHelpful = false;

  if (user) {
    const { count, error } = await supabase
      .from("helpful_review")
      .select("*", { head: true, count: "exact" })
      .eq("user_id", user.id)
      .eq("review_id", reviewIdNumber);

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
    review,
    isHelpful,
    meta: {
      ...meta,
      title: `${cube.name}'s Review by ${review.profile.display_name} - CubeIndex`,
      description: `Read ${review.profile.display_name}'s review: "${review.title}"`,
      noindex: false,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Review",
        reviewBody: review.review,
        name: review.title,
        itemReviewed: {
          "@type": "Product",
          name: cube.name,
          image: [cube.image_url],
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue:
            Object.values(review.ratings).reduce((sum, val) => sum + val, 0) /
            (Object.keys(review.ratings).length || 1),
          bestRating: 5,
          worstRating: 0,
        },
      },
    },
  };
}) satisfies PageServerLoad;
