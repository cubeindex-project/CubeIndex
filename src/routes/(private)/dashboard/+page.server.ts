import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { logError } from "$lib/server/logError";
import type { DetailedCube } from "$lib/components/dbTableTypes";

/**
 * Load data for the authenticated user dashboard.
 * - Requires a valid session; otherwise redirects to `/auth/login`.
 * - Returns lightweight profile info and key counts for quick overview.
 */
export const load = (async ({ locals }) => {
  const { supabase, user, log } = locals;
  if (!user) throw redirect(302, "/auth/login");

  // Fetch profile (username, display name, role) for greetings and links
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("username, display_name, user_id, profile_picture")
    .eq("user_id", user.id)
    .single();

  if (pErr) {
    return logError(500, "Unable to load profile", log, pErr);
  }

  // Parallel counts for dashboard stats
  const [
    { count: cubesCount = 0, error: cErr },
    { count: ratingsCount = 0, error: rErr },
    { count: achievementsCount = 0, error: aErr },
    { count: followersCount = 0, error: f1Err },
    { count: followingCount = 0, error: f2Err },
    { count: submissionsCount = 0, error: sErr },
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
    supabase
      .from("cube_models")
      .select("*", { head: true, count: "exact" })
      .eq("submitted_by_id", user.id),
  ]);

  if (cErr || rErr || aErr || f1Err || f2Err || sErr) {
    const aggregateError = cErr ?? rErr ?? aErr ?? f1Err ?? f2Err ?? sErr;
    return logError(500, "Failed to load dashboard stats", log, aggregateError);
  }

  // Recent activity (lightweight)
  const { data: recentSubmissionsRaw, error: rsErr } = await supabase
    .from("v_detailed_cube_models")
    .select("slug, name, image_url, status, created_at")
    .eq("submitted_by_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (rsErr || !recentSubmissionsRaw) {
    return logError(
      500,
      "Failed to load recent submission activity",
      log,
      rsErr ?? new Error("Missing recent submission activity data"),
    );
  }

  const recentSubmissions = recentSubmissionsRaw.map((r) => ({
    ...r,
    image_url: r.image_url ?? null,
  }));

  return {
    profile,
    stats: {
      cubesCount: cubesCount ?? 0,
      ratingsCount: ratingsCount ?? 0,
      achievementsCount: achievementsCount ?? 0,
      followersCount: followersCount ?? 0,
      followingCount: followingCount ?? 0,
      submissionsCount: submissionsCount ?? 0,
    },
    recent: {
      submissions: recentSubmissions as DetailedCube[],
    },
  };
}) satisfies PageServerLoad;
