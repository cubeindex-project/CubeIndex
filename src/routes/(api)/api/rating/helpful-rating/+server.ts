import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, request }) => {
  const {
    ratingId,
  }: {
    ratingId: number;
  } = await request.json();

  const { data: profile, error: profileErr } = await locals.supabase
    .from("profiles")
    .select("username")
    .eq("user_id", locals.user?.id)
    .single();

  if (profileErr)
    return json(
      {
        success: false,
        error: "Couldn't find connected user, check that you are logged in!",
      },
      { status: 500 }
    );

  const { data, error: selecErr } = await locals.supabase
    .from("helpful_cube_rating")
    .select("*")
    .eq("username", profile.username)
    .eq("rating", ratingId);

  if (selecErr)
    return json(
      {
        success: false,
        error:
          "Couldn't fetch rows from helpful_cube_rating:" + selecErr.message,
      },
      { status: 500 }
    );

  if (data.length) {
    console.log("deleting");
    const { error: err } = await locals.supabase
      .from("helpful_cube_rating")
      .delete()
      .eq("username", profile.username)
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
    console.log("inserting");
    const { error: err } = await locals.supabase
      .from("helpful_cube_rating")
      .insert([{ username: profile.username, rating: ratingId }]);

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
