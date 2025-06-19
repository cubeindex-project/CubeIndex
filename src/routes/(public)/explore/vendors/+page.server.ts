import { supabase } from "$lib/supabaseClient";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load = (async () => {
  const { data: vendors, error: err } = await supabase
    .from("vendors")
    .select("*")
    .order("name", { ascending: true });

  if (err) throw error(500, err.message);
  return { vendors };
}) satisfies PageServerLoad;
