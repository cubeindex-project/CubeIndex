import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals, request }) => {
  const {
    following_id,
  }: {
    following_id: string;
  } = await request.json();

  if (following_id === locals.user?.id)
    return Response.json(
      { success: false, error: "You can't follow yourself!" },
      { status: 500 },
    );

  const { error: err } = await locals.supabase.from("user_follows").insert([
    {
      following_id,
      follower_id: locals.user?.id,
      followed_at: new Date().toISOString(),
    },
  ]);

  if (err) {
    locals.log.error(
      { err, followingUserID: following_id, followerUserID: locals.user?.id },
      "Failed to follow user",
    );
    return Response.json(
      { success: false, error: "An error occurred: " + err.message },
      { status: 500 },
    );
  }

  locals.log.info(
    { event: "social.follow.created", followingUserID: following_id },
    "User followed",
  );
  return Response.json({ success: true });
};
