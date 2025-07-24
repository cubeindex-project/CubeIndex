import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, request }) => {
  const {
    ratingId,
    rating_category,
  }: {
    ratingId: number;
    rating_category: "cube" | "accessory";
  } = await request.json();

  const { data, error: selecErr } = await locals.supabase
    .from("helpful_rating")
    .select("*")
    .eq("user_id", locals.user?.id)
    .eq("rating", ratingId);

  if (selecErr)
    return json(
      {
        success: false,
        error: "Couldn't fetch rows from helpful_rating:" + selecErr.message,
      },
      { status: 500 }
    );

  if (data.length) {
    const { error: err } = await locals.supabase
      .from("helpful_rating")
      .delete()
      .eq("user_id", locals.user?.id)
      .eq("rating", ratingId);

    if (err)
      return json(
        {
          success: false,
          error: "An error occured while deleting: " + err.message,
        },
        { status: 500 }
      );
  } else {
    const { error: err } = await locals.supabase
      .from("helpful_rating")
      .insert([
        { user_id: locals.user?.id, rating: ratingId, rating_category },
      ]);

    if (err)
      return json(
        {
          success: false,
          error: "An error occured while inserting: " + err.message,
        },
        { status: 500 }
      );
  }

  return json({ success: true });
};
