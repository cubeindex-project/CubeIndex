import type { PageLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";
import { clientLogError } from "$lib/logger/clientLogError";
import { clientLogger } from "$lib/logger/client";

export const load = (async ({ setHeaders }) => {
  const { data, error: err } = await supabase
    .from("v_detailed_profiles")
    .select("*")
    .eq("onboarded", true)
    .order("id", { ascending: true });

  if (err) {
    return clientLogError("Unable to load user profiles", clientLogger, err);
  }

  const profiles = data ?? [];

  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  return {
    profiles,
    meta: {
      title: "Explore Users - CubeIndex",
      description:
        "Discover cubers on CubeIndex. Browse profiles, search by username, and explore collections, reviews, and activity to find people to follow and learn from.",
    },
  };
}) satisfies PageLoad;
