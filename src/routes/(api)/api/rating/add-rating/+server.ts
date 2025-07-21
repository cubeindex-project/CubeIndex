import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, locals }) => {
  const {
    cube_slug,
    rating,
    comment,
  }: {
    cube_slug: string;
    rating: number;
    comment: string;
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

  const { error: err } = await locals.supabase
    .from("user_ratings")
    .upsert([{ username: profile.username, cube_slug, rating, comment }]);

  if (
    err?.message ===
    'duplicate key value violates unique constraint "user_ratings_pkey"'
  )
    return json(
      {
        success: false,
        error: "You have already rated this cube!",
      },
      { status: 500 }
    );
  if (err)
    return json(
      { success: false, error: "An error occured: " + err.message },
      { status: 500 }
    );

  return json({ success: true });
};
