import { logError } from "$lib/server/logError";
import type { PageServerLoad } from "./$types";

export const load = (async ({ parent, locals: { supabase, log } }) => {
  const { profile, meta, canViewProfile, isFollowing } = await parent();

  if (!canViewProfile) {
    return {
      following: [],
      followers: [],
      isFollowing,
      meta: {
        ...meta,
        title: `${profile.display_name}'s Socials - CubeIndex`,
        noindex: true,
      },
    };
  }

  const [
    { data: followingId, error: followingErr },
    { data: followers_id, error: followedErr },
  ] = await Promise.all([
    supabase
      .from("user_follows")
      .select("following_id:profiles!following_id(*)")
      .eq("follower_id", profile.user_id),
    supabase
      .from("user_follows")
      .select("follower_id:profiles!follower_id(*)")
      .eq("following_id", profile.user_id),
  ]);

  if (followingErr) {
    return logError(500, "Unable to load following list", log, followingErr);
  }
  if (followedErr) {
    return logError(500, "Unable to load follower list", log, followedErr);
  }

  const following = (followingId ?? [])
    .map((ingId) => ingId.following_id)
    .filter((user) => !!user);

  const followers = (followers_id ?? [])
    .map((edId) => edId.follower_id)
    .filter((user) => !!user);

  return {
    following,
    followers,
    isFollowing,
    meta: {
      ...meta,
      title: `${profile.display_name}'s Socials - CubeIndex`,
      noindex: true,
    },
  };
}) satisfies PageServerLoad;
