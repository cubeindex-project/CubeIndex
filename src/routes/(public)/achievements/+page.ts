import { supabase } from "$lib/supabaseClient";
import type { PageLoad } from "./$types";
import { clientLogError } from "$lib/logger/clientLogError";
import { clientLogger } from "$lib/logger/client";

export const load = (async ({ setHeaders, parent }) => {
  const { user } = await parent();

  const { data: achievements, error: err } = await supabase
    .from("v_achievement_rarity")
    .select("*")
    .order("name", { ascending: true });

  if (err) {
    return clientLogError(
      "Unable to load achievements",
      clientLogger,
      err,
      true
    );
  }

  let currentUserAchi = [];

  if (user) {
    const { data, error: cuaErr } = await supabase
      .from("user_achievements")
      .select("*")
      .eq("user_id", user?.id);

    if (cuaErr) {
      return clientLogError(
        "Unable to load awarded achievements",
        clientLogger,
        cuaErr,
        true
      );
    }

    currentUserAchi = data;
  }

  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  return {
    achievements,
    currentUserAchi,
  };
}) satisfies PageLoad;
