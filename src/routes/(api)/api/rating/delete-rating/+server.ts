import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({
  request,
  locals: { supabase, user },
}) => {
  if (!user)
    return json({ success: false, error: "Unauthorized" }, { status: 500 });

  const {
    cube_slug,
    user_id,
  }: {
    cube_slug: string;
    user_id: string | undefined;
  } = await request.json();

  const { error: err } = await supabase
    .from("user_cube_ratings")
    .delete()
    .eq("user_id", user.id)
    .eq("cube_slug", cube_slug);

  if (err)
    return json(
      { success: false, error: "An error occurred: " + err.message },
      { status: 500 },
    );

  return json({ success: true });
};
