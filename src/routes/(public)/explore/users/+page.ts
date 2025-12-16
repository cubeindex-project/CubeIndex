import type { PageLoad } from "./$types";
import { supabase } from "$lib/supabaseClient";
import { clientLogError } from "$lib/logger/clientLogError";
import { clientLogger } from "$lib/logger/client";

const PROFILE_COLUMNS = [
  "id",
  "created_at",
  "user_id",
  "username",
  "private",
  "profile_picture",
  "bio",
  "socials",
  "banner",
  "verified",
  "certified",
  "role",
  "display_name",
  "onboarded",
  "user_cubes_count",
  "user_achievements_count",
  "user_following_count",
  "user_follower_count",
  "user_cube_ratings_count",
  "user_avg_rating_count",
].join(", ");

export const load = (async ({ setHeaders }) => {
  const { data, error: err } = await supabase
    .from("v_detailed_profiles")
    .select(PROFILE_COLUMNS)
    .eq("onboarded", true)
    .order("id", { ascending: true });

  if (err) {
    return clientLogError("Unable to load user profiles", clientLogger, err);
  }

  const profiles = data ?? [];

  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  return { profiles };
}) satisfies PageLoad;
