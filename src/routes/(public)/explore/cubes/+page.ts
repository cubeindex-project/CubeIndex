import { supabase } from "$lib/supabaseClient";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load = (async ({ setHeaders }) => {
  const { data: cubes, error: err } = await supabase
    .from("v_detailed_cube_models")
    .select("*")
    .eq("status", "Approved");

  if (err) error(500, err.message);

  return { cubes };

  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });
}) satisfies PageLoad;
