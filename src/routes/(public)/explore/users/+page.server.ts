import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ setHeaders, locals: { log, supabase } }) => {
  const { data: profiles, error: err } = await supabase
    .from("v_detailed_profiles")
    .select("*")
    .eq("onboarded", true)
    .order("id", { ascending: true });

  if (err) {
    log.error({ err, msg: "Unable to load user profiles" });
    throw error(500, "Unable to load user profiles");
  }

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
}) satisfies PageServerLoad;
