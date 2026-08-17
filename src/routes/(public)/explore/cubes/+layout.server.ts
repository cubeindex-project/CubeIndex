import { logError } from "$lib/server/logError";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals: { log, supabase } }) => {
  const { data, error: err } = await supabase
    .from("vendors")
    .select("slug, name")
    .order("name", { ascending: true });

  if (err) {
    return logError(500, "Failed to load vendors", log, err);
  }

  return {
    vendors: data,
  };
}) satisfies LayoutServerLoad;
