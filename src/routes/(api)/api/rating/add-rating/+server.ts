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

  const { error: err } = await locals.supabase
    .from("user_cube_ratings")
    .upsert([{ user_id: locals.user?.id, cube_slug, rating, comment }]);

  if (err)
    return json(
      { success: false, error: "An error occured: " + err.message },
      { status: 500 }
    );

  return json({ success: true });
};
