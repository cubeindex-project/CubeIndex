import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({
  locals: { supabase, user, log },
  request,
}) => {
  if (!user)
    return json({ success: false, error: "Unauthorized" }, { status: 401 });

  const {
    following_id,
  }: {
    following_id: string;
  } = await request.json();

  const { error: err } = await supabase
    .from("user_follows")
    .delete()
    .eq("following_id", following_id)
    .eq("follower_id", user?.id);

  if (err) {
    log.error(
      { err, followingUserID: following_id, followerUserID: user.id },
      "Failed to unfollow user",
    );
    return json(
      { success: false, error: "An error occurred: " + err.message },
      { status: 500 },
    );
  }

  return json({ success: true });
};
