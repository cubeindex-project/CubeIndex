import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

<<<<<<< HEAD
export const load = (async ({ locals }) => {
=======
export const load = (async ({ locals, parent }) => {
  const data = await parent();
>>>>>>> developer
  const { data: user_achievements, error: userAchieveError } =
    await locals.supabase
      .from("user_achievements")
      .select("*")
<<<<<<< HEAD
      .eq("user_id", locals.user?.id);
=======
      .eq("user_id", data.profile.user_id);
>>>>>>> developer

  if (userAchieveError) throw error(500, userAchieveError.message);

  const { data: achievements, error: achieveError } = await locals.supabase
    .from("achievements")
    .select("*");

  if (achieveError) throw error(500, achieveError.message);

  return { user_achievements, achievements };
}) satisfies PageServerLoad;
