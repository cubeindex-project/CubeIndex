import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({
  request,
  locals: { user, supabase },
}) => {
  if (!user)
    return json({ success: false, error: "Unauthorized" }, { status: 401 });

  const {
    collection_id,
  }: {
    collection_id: number;
  } = await request.json();

  const { error: err } = await supabase
    .from("user_cubes")
    .delete()
    .eq("id", collection_id);

  if (err)
    return json(
      { success: false, error: "An error occurred: " + err.message },
      { status: 500 },
    );

  return json({ success: true });
};
