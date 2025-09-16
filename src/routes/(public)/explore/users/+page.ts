import type { PageLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";
import { queryDetailedProfiles } from "$lib/queries/detailedProfiles";
import { error } from "@sveltejs/kit";

export const load = (async ({ setHeaders }) => {
  const { data, error: err } = await queryDetailedProfiles(supabase)
    .order("id", { ascending: true });

  if (err) throw error(500, err.message);

  const profiles = data ?? [];

  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  return { profiles };
}) satisfies PageLoad;
