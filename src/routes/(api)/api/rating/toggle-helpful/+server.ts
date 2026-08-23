import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({
  locals: { supabase, user },
  request,
}) => {
  if (!user)
    return json(
      {
        success: false,
        error: "Unauthorized",
      },
      { status: 401 },
    );

  const {
    ratingId,
    rating_category,
  }: {
    ratingId: number;
    rating_category: "cube" | "accessory";
  } = await request.json();

  const { count, error: countErr } = await supabase
    .from("helpful_rating")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("rating", ratingId);

  if (countErr)
    return json(
      {
        success: false,
        error: "Couldn't fetch rows from helpful_rating: " + countErr.message,
      },
      { status: 500 },
    );

  if (count && count > 0) {
    const { error: err } = await supabase
      .from("helpful_rating")
      .delete()
      .eq("user_id", user.id)
      .eq("rating", ratingId);

    if (err)
      return json(
        {
          success: false,
          error: "An error occurred while deleting: " + err.message,
        },
        { status: 500 },
      );
  } else {
    const { error: err } = await supabase
      .from("helpful_rating")
      .insert([{ user_id: user.id, rating: ratingId, rating_category }]);

    if (err)
      return json(
        {
          success: false,
          error: "An error occurred while inserting: " + err.message,
        },
        { status: 500 },
      );
  }

  return json({ success: true });
};
