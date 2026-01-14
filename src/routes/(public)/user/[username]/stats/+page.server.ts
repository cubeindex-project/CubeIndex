import type { PageServerLoad } from "./$types";
import { logError } from "$lib/server/logError";
import type { UserStats } from "$lib/components/dbTableTypes";

export const load = (async ({ params, locals }) => {
  const { supabase, log } = locals;
  const { username } = params;

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("user_id, username, display_name")
    .eq("username", username)
    .single();

  if (profileErr || !profile) {
    return logError(
      404,
      "User not found",
      log,
      profileErr ?? new Error("Profile not found"),
    );
  }

  const { data, error: statsErr } = await supabase
    .from("v_user_stats")
    .select("*")
    .eq("user_id", profile.user_id)
    .maybeSingle();

  if (statsErr) {
    return logError(500, "Failed to fetch user stats", log, statsErr);
  }

  const stats: UserStats = data || {};

  return {
    profile,
    stats,
    meta: { title: `${profile.display_name}'s Statistics - CubeIndex` },
  };
}) satisfies PageServerLoad;
