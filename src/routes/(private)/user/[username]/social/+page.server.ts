import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { UserFollowsRow } from "$lib/components/dbTableTypes";

export const load = (async ({ locals, parent }) => {
  const { profile } = await parent();

  const { data: followingId, error: followingErr } = await locals.supabase
    .from("user_follows")
    .select("following_id(*)")
    .eq("follower_id", profile.user_id);

  if (followingErr) throw error(500, followingErr.message);

  const { data: followers_id, error: followedErr } = await locals.supabase
    .from("user_follows")
    .select("follower_id(*)")
    .eq("following_id", profile.user_id);

  if (followedErr) throw error(500, followedErr.message);

  const following = followingId.map((ingId) => {
    const user = ingId.following_id;
    return user;
  });

  const followers = followers_id.map((edId) => {
    const user = edId.follower_id;
    return user;
  });

  let currentFollowingUser: UserFollowsRow[] = [];

  if (locals.user?.id) {
    const { data, error: followErr } = await locals.supabase
      .from("user_follows")
      .select("*")
      .eq("follower_id", locals.user.id)
      .eq("following_id", profile.user_id);

    if (followErr) throw error(500, followErr.message);
    currentFollowingUser = data;
  }

  return {
    following,
    followers,
    isFollowing: currentFollowingUser.length !== 1,
  };
}) satisfies PageServerLoad;
