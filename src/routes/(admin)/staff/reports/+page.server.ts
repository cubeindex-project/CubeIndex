import type { PageServerLoad } from "./$types";
import { logError } from "$lib/server/logError";

export const load = (async ({ locals }) => {
  const { data: reports, error: err } = await locals.supabase
    .from("reports")
    .select("*");

  if (err) {
    return logError(500, "Unable to load reports", locals.log, err);
  }

  const { data: profiles, error: pErr } = await locals.supabase
    .from("profiles")
    .select("*");

  if (pErr) {
    return logError(500, "Unable to load profiles", locals.log, pErr);
  }

  const { data: user_cube_ratings, error: ucrErr } = await locals.supabase
    .from("user_cube_ratings")
    .select("*");

  if (ucrErr) {
    return logError(500, "Unable to load user cube ratings", locals.log, ucrErr);
  }

  return { reports, profiles, user_cube_ratings };
}) satisfies PageServerLoad;
