import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { logError } from "$lib/server/logError";
import type {
  UserCubeReviewRating,
  UserCubeReviewsCategory,
} from "$lib/components/dbTableTypes";

interface ReviewCategoryRating extends UserCubeReviewsCategory {
  rating: number;
}

export const load = (async ({ locals: { supabase, user, log }, params }) => {
  if (!user) throw redirect(302, "/auth/login");
  const slug = params.slug;

  const { data: cube, error: cubeErr } = await supabase
    .from("v_detailed_cube_models")
    .select("name")
    .eq("slug", slug)
    .maybeSingle();

  if (cubeErr) {
    return logError(500, "Failed to fetch cube name", log, cubeErr);
  }

  const cubeName = cube.name;

  const { data: existingReview, error: erErr } = await supabase
    .from("user_cube_reviews")
    .select("*")
    .eq("cube", slug)
    .eq("user_id", user.id)
    .maybeSingle();

  if (erErr)
    return logError(500, "Failed to fetch existing review", log, erErr);

  let review = existingReview;

  if (!existingReview) {
    const { data: createdReview, error: crErr } = await supabase
      .from("user_cube_reviews")
      .insert({
        cube: slug,
        user_id: user.id,
        title: "",
        review: "",
        status: "draft",
      })
      .select("*")
      .single();

    if (crErr)
      return logError(500, "Failed to fetch created review", log, crErr);

    review = createdReview;
  }

  const { data: reviewCategories, error: categoryErr } = await supabase
    .from("user_cube_reviews_categories")
    .select("id, slug, label")
    .eq("active", true)
    .order("id", { ascending: true });

  if (categoryErr)
    return logError(500, "Failed to fetch review categories", log, categoryErr);

  const { data: reviewRatingsRaw, error: ratingsErr } = await supabase
    .from("user_cube_reviews_ratings")
    .select("category_id, rating")
    .eq("review_id", review.id);

  if (ratingsErr)
    return logError(500, "Failed to fetch review ratings", log, ratingsErr);

  const reviewRatings = new Map<number, number>(
    reviewRatingsRaw.map((entry: UserCubeReviewRating) => [
      entry.category_id,
      entry.rating,
    ]),
  );

  const categoryRatings: ReviewCategoryRating[] = reviewCategories.map(
    (category: UserCubeReviewsCategory) => ({
      ...category,
      rating: reviewRatings.get(category.id) ?? 0.5,
    }),
  );

  return {
    slug,
    cubeName,
    review,
    reviewCategories,
    reviewRatings,
    categoryRatings,
    meta: { noindex: true },
  };
}) satisfies PageServerLoad;
