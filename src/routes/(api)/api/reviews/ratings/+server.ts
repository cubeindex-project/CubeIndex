import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export interface RatingsPayload {
  slug: string;
  ratings: {
    category_id: number;
    rating: number;
  }[];
}

export const POST: RequestHandler = async ({
  locals: { supabase, user, log },
  request,
}) => {
  if (!user) return json({ error: "Unauthorized" }, { status: 401 });

  const payload: RatingsPayload = await request.json();

  if (!payload?.slug || !Array.isArray(payload.ratings)) {
    return json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!payload.ratings.length) {
    return json({});
  }

  const invalidRating = payload.ratings.some(
    (entry) =>
      typeof entry.category_id !== "number" ||
      typeof entry.rating !== "number" ||
      entry.rating < 0.5 ||
      entry.rating > 5,
  );

  if (invalidRating) {
    return json({ error: "Invalid rating values" }, { status: 400 });
  }

  const { data: review, error: reviewErr } = await supabase
    .from("user_cube_reviews")
    .select("id")
    .eq("cube", payload.slug)
    .eq("user_id", user.id)
    .maybeSingle();

  if (reviewErr) {
    log.error({ err: reviewErr }, "Failed to fetch review for ratings");
    return json({ error: "Failed to fetch review" }, { status: 500 });
  }

  if (!review) {
    return json({ error: "Review not found" }, { status: 404 });
  }

  const ratingRows = payload.ratings.map((entry) => ({
    review_id: review.id,
    category_id: entry.category_id,
    rating: entry.rating,
  }));

  const { error: ratingErr } = await supabase
    .from("user_cube_reviews_ratings")
    .upsert(ratingRows, {
      onConflict: "review_id,category_id",
    });

  if (ratingErr) {
    log.error({ err: ratingErr }, "Failed to upsert review ratings");
    return json({ error: "Failed to save ratings" }, { status: 500 });
  }

  return json({});
};
