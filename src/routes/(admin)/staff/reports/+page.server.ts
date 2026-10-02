import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {
  const { data: reports, error: err } = await locals.supabase
    .from("reports")
    .select("*");

  if (err) {
    locals.log.error({ err, msg: "Unable to load reports" });
    throw error(500, "Unable to load reports");
  }

  const { data: profiles, error: pErr } = await locals.supabase
    .from("profiles")
    .select("*");

  if (pErr) {
    locals.log.error({ err: pErr, msg: "Unable to load profiles" });
    throw error(500, "Unable to load profiles");
  }

  const { data: user_cube_ratings, error: ucrErr } = await locals.supabase
    .from("user_cube_ratings")
    .select("*");

  if (ucrErr) {
    locals.log.error({ err: ucrErr, msg: "Unable to load user cube ratings" });
    throw error(500, "Unable to load user cube ratings");
  }

  return { reports, profiles, user_cube_ratings };
}) satisfies PageServerLoad;
