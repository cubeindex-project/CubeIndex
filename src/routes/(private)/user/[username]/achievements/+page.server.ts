import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load = (async ({ locals }) => {
  const { data: user_achievements, error: userAchieveError } =
    await locals.supabase
      .from("user_achievements")
      .select("*")
      .eq("user_id", locals.user?.id);

  if (userAchieveError) throw error(500, userAchieveError.message);

  const { data: achievements, error: achieveError } = await locals.supabase
    .from("achievements")
    .select("*");

  if (achieveError) throw error(500, achieveError.message);

  return { user_achievements, achievements };
}) satisfies PageServerLoad;
