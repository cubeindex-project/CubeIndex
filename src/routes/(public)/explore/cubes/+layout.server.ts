import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals: { log, supabase } }) => {
  const { data, error: err } = await supabase
    .from("vendors")
    .select("id,slug, name")
    .order("name", { ascending: true });

  if (err) {
    log.error({ err, msg: "Failed to load vendors" });
    throw error(500, "Failed to load vendors");
  }

  return {
    vendors: data,
  };
}) satisfies LayoutServerLoad;
