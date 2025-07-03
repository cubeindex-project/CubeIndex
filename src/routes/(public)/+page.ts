import type { PageLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";
import { error } from "@sveltejs/kit";

export const load = (async () => {
  const { data: cube_models, error: err } = await supabase
    .from("cube_models")
    .select("id")
    .eq("status", "Approved");

  if (err) throw error(500, err.message);

  const totalCubes = cube_models.length;

  const { data: profiles, error: profilesErr } = await supabase
    .from("profiles")
    .select("id");

  if (profilesErr) throw error(500, profilesErr.message);

  const totalUsers = profiles.length;

  const { data: achievements, error: achiErr } = await supabase
    .from("achievements")
    .select("unlockable");

  if (achiErr) throw error(500, achiErr.message);

  return { totalCubes, totalUsers, achievements };
}) satisfies PageLoad;
