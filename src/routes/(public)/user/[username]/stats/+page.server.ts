import type { PageServerLoad } from "./$types";
import { logError } from "$lib/server/logError";

export const load = (async ({ params, locals: { supabase, log }, parent }) => {
  const { profile, meta, canViewProfile } = await parent();

  if (!canViewProfile) {
    return {
      profile,
      stats: null,
      meta: {
        ...meta,
        title: `${profile.display_name}'s Statistics - CubeIndex`,
        noindex: true,
      },
    };
  }

  const { data: stats, error: statsErr } = await supabase
    .from("v_user_stats")
    .select("*")
    .eq("user_id", profile.user_id)
    .maybeSingle();

  if (statsErr) {
    return logError(500, "Failed to fetch user stats", log, statsErr);
  }

  return {
    profile,
    stats,
    meta: {
      ...meta,
      title: `${profile.display_name}'s Statistics - CubeIndex`,
      noindex: true,
    },
  };
}) satisfies PageServerLoad;
