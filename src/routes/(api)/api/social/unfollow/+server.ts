import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, request }) => {
  const {
    following_id,
  }: {
    following_id: string;
  } = await request.json();

  const { error: err } = await locals.supabase
    .from("user_follows")
    .delete()
    .eq("following_id", following_id)
    .eq("follower_id", locals.user?.id);

  if (err)
    return json(
      { success: false, error: "An error occurred: " + err.message },
      { status: 500 }
    );

  return json({ success: true });
};
