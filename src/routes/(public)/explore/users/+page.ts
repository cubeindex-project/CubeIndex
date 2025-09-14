import type { PageLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";
import { error } from "@sveltejs/kit";

export const load = (async ({ setHeaders }) => {
  const { data: profiles, error: err } = await supabase
    .from("v_detailed_profiles")
    .select("*")
    .order("id", { ascending: true });

  if (err) throw error(500, err.message);

  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  return { profiles };
}) satisfies PageLoad;
