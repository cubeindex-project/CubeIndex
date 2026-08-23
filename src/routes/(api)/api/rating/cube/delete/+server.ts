import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({
  request,
  locals: { supabase, user, log },
}) => {
  if (!user)
    return json({error: "Unauthorized" }, { status: 500 });

  const {
    rating_id,
  }: {
    rating_id: number;
  } = await request.json();

  const { error: err } = await supabase
    .from("user_cube_ratings")
    .delete()
    .eq("id", rating_id);

  if (err){
    log.error({err}, "An error occurred while deleting rating");
    return json(
      { error: "An error occurred while deleting rating" },
      { status: 500 },
    );}

  return json({ success: true });
};
