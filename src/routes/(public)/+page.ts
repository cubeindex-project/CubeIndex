import type { PageLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";
import { error, redirect } from "@sveltejs/kit";

export const load = (async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    throw redirect(303, "/home");
  }
  const { error: err, count: totalCubesConst } = await supabase
    .from("cube_models")
    .select("*", { count: "exact", head: true })
    .eq("status", "Approved");

  if (err) throw error(500, err.message);

  const totalCubes = totalCubesConst ? totalCubesConst : 0;

  const { error: profilesErr, count: totalUsersConst } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  if (profilesErr) throw error(500, profilesErr.message);

  const totalUsers = totalUsersConst ? totalUsersConst : 0;

  const { data: achievements, error: achiErr } = await supabase
    .from("achievements")
    .select("unlockable");

  if (achiErr) throw error(500, achiErr.message);

  return { totalCubes, totalUsers, achievements };
}) satisfies PageLoad;
