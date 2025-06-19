import { supabase } from "$lib/supabaseClient";
import { error } from "@sveltejs/kit";

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  const { data: achievements, error: err } = await supabase
    .from("achievements")
    .select("*")
    .order("name", { ascending: true });

  if (err) throw error(500, err.message);

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, username");

  if (profilesError) throw error(500, profilesError.message);

  return {
    profiles,
    achievements,
  };
}
