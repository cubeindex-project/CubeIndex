import type { PageLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";
import { redirect } from "@sveltejs/kit";
import { clientLogError } from "$lib/logger/clientLogError";
import { clientLogger } from "$lib/logger/client";

export const load = (async ({ parent }) => {
  // If already authenticated, send users to their dashboard instead of marketing homepage
  const { session } = await parent();
  if (session) throw redirect(302, "/dashboard");
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

  if (err) {
    return clientLogError(
      "Unable to load cube statistics",
      clientLogger,
      err
    );
  }
  if (profilesErr) {
    return clientLogError(
      "Unable to load user statistics",
      clientLogger,
      profilesErr
    );
  }
  if (achiErr) {
    return clientLogError(
      "Unable to load achievements",
      clientLogger,
      achiErr
    );
  }

  return {
    totalCubes: totalCubesConst ?? 0,
    totalUsers: totalUsersConst ?? 0,
    achievements,
  };
}) satisfies PageLoad;
