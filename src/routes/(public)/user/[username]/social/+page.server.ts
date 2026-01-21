import type { UserFollowsRow } from "$lib/components/dbTableTypes";
import { logError } from "$lib/server/logError";
import type { PageServerLoad } from "./$types";

export const load = (async ({ parent, locals: { supabase, log, user } }) => {
  const { profile } = await parent();

  const [
    { data: followingId, error: followingErr },
    { data: followers_id, error: followedErr },
  ] = await Promise.all([
    supabase
      .from("user_follows")
      .select("following_id(*)")
      .eq("follower_id", profile.user_id),
    supabase
      .from("user_follows")
      .select("follower_id(*)")
      .eq("following_id", profile.user_id),
  ]);

  if (followingErr) {
    return logError(500, "Unable to load following list", log, followingErr);
  }
  if (followedErr) {
    return logError(500, "Unable to load follower list", log, followedErr);
  }

  const following = followingId.map((ingId) => {
    const user = ingId.following_id;
    return user;
  });

  const followers = followers_id.map((edId) => {
    const user = edId.follower_id;
    return user;
  });

  let currentFollowingUser: UserFollowsRow[] = [];

  if (user?.id) {
    const { data, error: followErr } = await supabase
      .from("user_follows")
      .select("*")
      .eq("follower_id", user.id)
      .eq("following_id", profile.user_id);

    if (followErr) {
      return logError(500, "Unable to check follow status", log, followErr);
    }
    currentFollowingUser = data;
  }

  return {
    following,
    followers,
    isFollowing: currentFollowingUser.length !== 1,
    meta: {
      title: `${profile.display_name}'s Socials - CubeIndex`,
      noindex: true,
    },
  };
}) satisfies PageServerLoad;
