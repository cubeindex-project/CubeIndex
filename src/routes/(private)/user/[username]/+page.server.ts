import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, parent }) => {
  const data = await parent();

  const { data: user_cubes, error: ucErr } = await locals.supabase
    .from("user_cubes")
    .select(`*, cube_models(*)`)
    .eq("user_id", data.profile.user_id);

  if (ucErr) throw error(500, ucErr.message);

  const main_cubes = user_cubes
    .filter((uc) => uc.main === true)
    .map((mc) => {
      const cube = mc.cube_models;
      return cube;
    });

  const { data: user_achievements, error: uaErr } = await locals.supabase
    .from("user_achievements")
    .select("*")
    .eq("user_id", data.profile.user_id);

  if (uaErr) throw error(500, uaErr.message);

  // 1) Get all users who follow the current profile
  const { data: followers, error: followersErr } = await locals.supabase
    .from("user_follows")
    .select("follower_id")
    .eq("following_id", data.profile.user_id);

  if (followersErr) {
    throw error(500, followersErr.message);
  }

  // Pull out a simple array of IDs
  const followerIds = followers.map((f) => f.follower_id);

  // 2) Get all users this profile follows, but only those in followerIds
  const { data: friends, error: friendsErr } = await locals.supabase
    .from("user_follows")
    .select("following_id(profile_picture, display_name, username)")
    .eq("follower_id", data.profile.user_id)
    .in("following_id", followerIds);

  if (friendsErr) {
    throw error(500, friendsErr.message);
  }

  const friendsProfiles = friends.map((f) => f.following_id);

  const { data: user_cube_ratings, error: urErr } = await locals.supabase
    .from("user_cube_ratings")
    .select("*")
    .eq("user_id", data.profile.user_id);

  if (urErr) {
    throw error(500, `Failed to fetch user ratings: ${urErr.message}`);
  }

  return {
    main_cubes,
    user_cubes,
    user_achievements,
    friends: friendsProfiles,
    user_cube_ratings,
  };
}) satisfies PageServerLoad;
