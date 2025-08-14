import { supabase } from "$lib/supabaseClient";
import { error } from "@sveltejs/kit";

/** @type {import('./$types').PageServerLoad} */
export async function load({ setHeaders }) {
  const { data: achievements, error: err } = await supabase
    .from("achievements")
    .select("*")
    .order("name", { ascending: true });

  if (err) throw error(500, err.message);

  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  return {
    achievements,
  };
}
