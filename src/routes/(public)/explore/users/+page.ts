import type { PageLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";
import { error } from "@sveltejs/kit";

export const load = (async ({ setHeaders }) => {
  const [
    { data: profiles, error: err },
    { data: user_achievements, error: userAchieveError },
    { data: user_cubes, error: userCubesError },
  ] = await Promise.all([
    supabase.from("profiles").select("*").order("id", { ascending: true }),
    supabase.from("user_achievements").select("*"),
    supabase.from("user_cubes").select("*"),
  ]);

  if (err) throw error(500, err.message);
  if (userAchieveError) throw error(500, userAchieveError.message);
  if (userCubesError) throw error(500, userCubesError.message);

  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  return { profiles, user_achievements, user_cubes };
}) satisfies PageLoad;
