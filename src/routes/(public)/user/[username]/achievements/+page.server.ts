import type { PageServerLoad } from "./$types";
import { logError } from "$lib/server/logError";

export const load = (async ({ parent, locals: { supabase, log } }) => {
  const { profile } = await parent();

  const { data, error: userAchieveError } = await supabase
    .from("user_achievements")
    .select(
      "*, achievement:achievement_slug(*), rarity:v_achievement_rarity(rarity)",
    )
    .eq("user_id", profile.user_id);

  if (userAchieveError) {
    return logError(
      500,
      "Unable to load user achievements",
      log,
      userAchieveError,
    );
  }

  const user_achievements = data.map((ua) => ({
    ...ua.achievement,
    awarded_at: ua.awarded_at,
    rarity: ua.rarity?.rarity,
  }));

  return {
    user_achievements,
    meta: {
      title: `${profile.display_name}'s Achievements - CubeIndex`,
      description: `See ${profile.display_name}'s achievements on CubeIndex.`,
    },
  };
}) satisfies PageServerLoad;
