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

  const { data, error: selecErr } = await supabase
    .from("helpful_rating")
    .select("*")
    .eq("user_id", user.id)
    .eq("rating", ratingId);

  if (selecErr?.message === 'invalid input syntax for type uuid: "undefined"')
    return json(
      {
        success: false,
        error: "You must be logged in to perform this action!",
      },
      { status: 500 },
    );

  if (selecErr)
    return json(
      {
        success: false,
        error: "Couldn't fetch rows from helpful_rating: " + selecErr.message,
      },
      { status: 500 },
    );

  if (data.length) {
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
