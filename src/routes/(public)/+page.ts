import type { PageLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";
import { error } from "@sveltejs/kit";

export const load = (async () => {
  const [
    { error: err, count: totalCubesConst },
    { error: profilesErr, count: totalUsersConst },
    { data: achievements, error: achiErr },
  ] = await Promise.all([
    supabase
      .from("cube_models")
      .select("*", { count: "exact", head: true })
      .eq("status", "Approved"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("achievements").select("unlockable"),
  ]);

  if (err) throw error(500, err.message);
  if (profilesErr) throw error(500, profilesErr.message);
  if (achiErr) throw error(500, achiErr.message);

  return {
    totalCubes: totalCubesConst ?? 0,
    totalUsers: totalUsersConst ?? 0,
    achievements,
  };
}) satisfies PageLoad;
