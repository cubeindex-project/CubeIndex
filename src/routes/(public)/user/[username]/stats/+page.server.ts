import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals: { supabase, log }, parent }) => {
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
    log.error({ err: statsErr }, "Failed to fetch user stats");
    throw error(500, "Failed to fetch user stats");
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
