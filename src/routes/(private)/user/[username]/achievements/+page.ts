import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { supabase } from "$lib/supabaseClient";

export const load = (async ({ parent }) => {
  const { profile } = await parent();

  const { data, error: userAchieveError } = await supabase
    .from("user_achievements")
    .select("*, achievement(*)")
    .eq("user_id", profile.user_id);

  if (userAchieveError) throw error(500, userAchieveError.message);

  const user_achievements = data.map((ua) => ua.achievement);

  return { user_achievements };
}) satisfies PageLoad;
