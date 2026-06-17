import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({
  request,
  locals: { user, supabase },
}) => {
  if (!user)
    return json({ success: false, error: "Unauthorized" }, { status: 401 });

  const {
    slug,
  }: {
    slug: string;
  } = await request.json();

  const { error: err } = await supabase
    .from("user_cubes")
    .delete()
    .eq("user_id", user.id)
    .eq("cube", slug);

  if (err)
    return json(
      { success: false, error: "An error occurred: " + err.message },
      { status: 500 },
    );

  return json({ success: true });
};
