import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { supabase } from "$lib/supabaseClient";

export const load = (async ({ parent }) => {
  const { profile } = await parent();

  const { data: user_achievements, error: userAchieveError } =
    await supabase
      .from("user_achievements")
      .select("*")
      .eq("username", profile.username);

  if (userAchieveError) throw error(500, userAchieveError.message);

  const { data: achievements, error: achieveError } = await supabase
    .from("achievements")
    .select("*");

  if (achieveError) throw error(500, achieveError.message);

  return { user_achievements, achievements };
}) satisfies PageServerLoad;
