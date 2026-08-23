import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({
  request,
  locals: { supabase, log, user },
}) => {
  if (!user) {
    return json(
      {
        error: "You must be logged in to perform this action!",
      },
      { status: 401 },
    );
  }

  const {
    cube_id,
    rating,
    comment,
  }: {
    cube_id: number;
    rating: number;
    comment: string;
  } = await request.json();

  if (comment.length > 500)
    return json({ error: "Comment too long" }, { status: 400 });

  const { error: err } = await supabase
    .from("user_cube_ratings")
    .upsert([{ user_id: user.id, cube_id, rating, comment }]);

  if (err) {
    log.error({ err }, "An error occurred while adding rating");
    return json(
      { error: "An error occurred while adding rating" },
      { status: 500 },
    );
  }

  return new Response(null, { status: 204 });
};
