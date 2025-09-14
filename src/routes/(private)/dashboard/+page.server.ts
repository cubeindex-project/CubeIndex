import type { PageServerLoad } from "./$types";
import { redirect, error } from "@sveltejs/kit";

/**
 * Load data for the authenticated user dashboard.
 * - Requires a valid session; otherwise redirects to `/auth/login`.
 * - Returns lightweight profile info and key counts for quick overview.
 */
export const load = (async ({ locals: { supabase, user } }) => {
  if (!user) throw redirect(302, "/auth/login");

  // Fetch profile (username, display name, role) for greetings and links
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("username, display_name, user_id, profile_picture")
    .eq("user_id", user.id)
    .single();

  if (pErr) throw error(500, "Unable to load profile: " + pErr.message);

  // Parallel counts for dashboard stats
  const [
    { count: cubesCount = 0, error: cErr },
    { count: ratingsCount = 0, error: rErr },
    { count: achievementsCount = 0, error: aErr },
    { count: followersCount = 0, error: f1Err },
    { count: followingCount = 0, error: f2Err },
  ] = await Promise.all([
    supabase
      .from("user_cubes")
      .select("*", { head: true, count: "exact" })
      .eq("user_id", user.id),
    supabase
      .from("user_cube_ratings")
      .select("*", { head: true, count: "exact" })
      .eq("user_id", user.id),
    supabase
      .from("user_achievements")
      .select("*", { head: true, count: "exact" })
      .eq("user_id", user.id),
    supabase
      .from("user_follows")
      .select("*", { head: true, count: "exact" })
      .eq("following_id", user.id),
    supabase
      .from("user_follows")
      .select("*", { head: true, count: "exact" })
      .eq("follower_id", user.id),
  ]);

  if (cErr || rErr || aErr || f1Err || f2Err) {
    throw error(500, "Failed to load dashboard stats");
  }

  // Recent activity (lightweight)
  const [
    { data: recentCubesRaw = [], error: rcErr },
    { data: recentRatingsRaw = [], error: rrErr },
    { data: recentAchievementsRaw = [], error: raErr },
  ] = await Promise.all([
    supabase
      .from("user_cubes")
      .select(
        "cube, created_at, main, status, condition, cube_models(slug, series, model, version_name, brand, image_url)"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("user_cube_ratings")
      .select(
        "cube_slug, rating, updated_at, cube_models(slug, series, model, version_name, brand, image_url)"
      )
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("user_achievements")
      .select(
        "achievement_slug, awarded_at, achievements(name, title, icon), rarity:v_achievement_rarity(rarity)"
      )
      .eq("user_id", user.id)
      .order("awarded_at", { ascending: false })
      .limit(5),
  ]);

  if (rcErr || !recentCubesRaw)
    throw error(500, "Failed to load recent cube activity: " + rcErr?.message);

  if (rrErr || !recentRatingsRaw)
    throw error(
      500,
      "Failed to load recent rating activity: " + rrErr?.message
    );

  if (raErr || !recentAchievementsRaw)
    throw error(
      500,
      "Failed to load recent achievement activity: " + raErr?.message
    );

  const recentCubes = recentCubesRaw.map((r) => ({
    ...r,
    cube_data: r.cube_models,
  }));
  const recentRatings = recentRatingsRaw.map((r) => ({
    ...r,
    cube_data: r.cube_models,
  }));
  const recentAchievements = recentAchievementsRaw.map((r) => ({
    ...r,
    achievement_data: {
      ...(r.achievements || {}),
      ...(r.rarity || {}),
    },
  }));

  return {
    profile,
    stats: {
      cubesCount: cubesCount ?? 0,
      ratingsCount: ratingsCount ?? 0,
      achievementsCount: achievementsCount ?? 0,
      followersCount: followersCount ?? 0,
      followingCount: followingCount ?? 0,
    },
    recent: {
      cubes: recentCubes,
      ratings: recentRatings,
      achievements: recentAchievements,
    },
  };
}) satisfies PageServerLoad;
