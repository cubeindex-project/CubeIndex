import { supabase } from "$lib/supabaseClient";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load = (async ({ setHeaders }) => {
  const { data: vendors, error: err } = await supabase
    .from("vendors")
    .select("*")
    .order("name", { ascending: true });

  if (err) throw error(500, err.message);

  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  return { vendors };
}) satisfies PageServerLoad;
