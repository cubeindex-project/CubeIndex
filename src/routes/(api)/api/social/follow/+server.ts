import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, request }) => {
  const {
    following_id,
  }: {
    following_id: string;
  } = await request.json();

  if (following_id === locals.user?.id)
    return json(
      { success: false, error: "You can't follow yourself!" },
      { status: 500 }
    );

  const { error: err } = await locals.supabase.from("user_follows").insert([
    {
      following_id,
      follower_id: locals.user?.id,
      followed_at: new Date().toISOString(),
    },
  ]);

  if (err)
    return json(
      { success: false, error: "An error occurred: " + err.message },
      { status: 500 }
    );

  return json({ success: true });
};
