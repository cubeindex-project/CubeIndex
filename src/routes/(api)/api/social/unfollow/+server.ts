import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({
  locals: { supabase, user, log },
  request,
}) => {
  if (!user)
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );

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
    return Response.json(
      { success: false, error: "An error occurred: " + err.message },
      { status: 500 },
    );
  }

  log.info(
    { event: "social.follow.removed", followingUserID: following_id },
    "User unfollowed",
  );
  return Response.json({ success: true });
};
