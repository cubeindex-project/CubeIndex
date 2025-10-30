import type { UserFollowsRow } from "$lib/components/dbTableTypes";
import type { PageLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";
import { clientLogError } from "$lib/logger/clientLogError";
import { clientLogger } from "$lib/logger/client";


export const load = (async ({ parent }) => {
  const { profile, user } = await parent();

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
    return clientLogError(
      "Unable to load following list",
      clientLogger,
      followingErr
    );
  }
  if (followedErr) {
    return clientLogError(
      "Unable to load follower list",
      clientLogger,
      followedErr
    );
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
      return clientLogError(
        "Unable to check follow status",
        clientLogger,
        followErr
      );
    }
    currentFollowingUser = data;
  }

  return {
    following,
    followers,
    isFollowing: currentFollowingUser.length !== 1,
  };
}) satisfies PageLoad;
