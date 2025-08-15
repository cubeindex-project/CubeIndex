import { supabase } from "$lib/supabaseClient";
import { error } from "@sveltejs/kit";

export async function load({ setHeaders }) {
  const { data: accessories, error: err } = await supabase
    .from("accessories")
    .select("*")
    .order("name", { ascending: true });

  if (err) throw error(500, err.message);

  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  return { accessories };
}
