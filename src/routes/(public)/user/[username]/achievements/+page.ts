import type { PageLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";
import { clientLogError } from "$lib/logger/clientLogError";
import { clientLogger } from "$lib/logger/client";

export const load = (async ({ parent }) => {
  const { profile } = await parent();

  const { data, error: userAchieveError } = await supabase
    .from("user_achievements")
    .select(
      "*, achievement:achievement_slug(*), rarity:v_achievement_rarity(rarity)"
    )
    .eq("user_id", profile.user_id);

  if (userAchieveError) {
    return clientLogError(
      "Unable to load user achievements",
      clientLogger,
      userAchieveError
    );
  }

  const user_achievements = data.map((ua) => ({
    ...ua.achievement,
    awarded_at: ua.awarded_at,
    rarity: ua.rarity?.rarity,
  }));

  return { user_achievements };
}) satisfies PageLoad;
