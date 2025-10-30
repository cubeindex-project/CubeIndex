import type { PageLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";
import { queryDetailedProfiles } from "$lib/queries/detailedProfiles";
import { clientLogError } from "$lib/logger/clientLogError";
import { clientLogger } from "$lib/logger/client";

export const load = (async ({ setHeaders }) => {
  const { data, error: err } = await queryDetailedProfiles(supabase)
    .eq("onboarded", true)
    .order("id", { ascending: true });

  if (err) {
    return clientLogError(
      "Unable to load user profiles",
      clientLogger,
      err
    );
  }

  const profiles = data ?? [];

  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  return { profiles };
}) satisfies PageLoad;
