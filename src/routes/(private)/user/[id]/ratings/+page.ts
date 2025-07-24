import type { PageLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";

export const load = (async ({ params }) => {
  const id = params.id;

  const { data: cubes, error: cErr } = await supabase
    .from("cube_models")
    .select("*")
    .order("model", { ascending: true })
    .order("series", { ascending: true });

  if (cErr) {
    console.error("A 500 status code error occured:", cErr.message);
    return;
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("id", id)
    .single();

  if (profileErr) {
    console.error(`Failed to fetch profile: ${profileErr.message}`);
    return;
  }

  const { data: user_cube_ratings, error: urErr } = await supabase
    .from("user_cube_ratings")
    .select("*")
    .eq("user_id", profile.user_id);

  if (urErr) {
    console.error(`Failed to fetch user ratings: ${urErr.message}`);
    return;
  }

  return { cubes, user_cube_ratings };
}) satisfies PageLoad;
