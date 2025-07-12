import type { PageServerLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";
import { error } from "@sveltejs/kit";

export const load = (async () => {
  const { data: staff_logs, error: err } = await supabase
    .from("staff_logs")
    .select("*")
    .order("id", { ascending: true });

  if (err) throw error(500, err.message);

  return { staff_logs };
}) satisfies PageServerLoad;
