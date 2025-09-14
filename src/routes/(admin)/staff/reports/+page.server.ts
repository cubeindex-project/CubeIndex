import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {
  const { data: reports, error: err } = await locals.supabase
    .from("reports")
    .select("*");

  if (err) throw error(500, err.message);

  const { data: profiles, error: pErr } = await locals.supabase
    .from("profiles")
    .select("*");

  if (pErr) throw error(500, pErr.message);

  const { data: user_cube_ratings, error: ucrErr } = await locals.supabase
    .from("user_cube_ratings")
    .select("*");

  if (ucrErr) throw error(500, ucrErr.message);

  return { reports, profiles, user_cube_ratings };
}) satisfies PageServerLoad;
