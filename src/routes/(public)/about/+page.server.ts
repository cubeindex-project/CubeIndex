import { supabase } from "$lib/supabaseClient";
import { error } from "@sveltejs/kit";

export const load = async () => {
  const { data: profiles, error: err } = await supabase
    .from("profiles")
    .select("*");

  if (err) throw error(500, err.message);

  return { profiles };
};
