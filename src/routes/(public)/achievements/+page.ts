import { supabase } from "$lib/supabaseClient";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load = (async ({ setHeaders, parent }) => {
  const { user } = await parent();

  const { data: achievements, error: err } = await supabase
    .from("v_achievement_rarity")
    .select("*")
    .order("name", { ascending: true });

  if (err) throw error(500, err.message);

  let currentUserAchi = [];

  if (user) {
    const { data, error: cuaErr } = await supabase
      .from("user_achievements")
      .select("*")
      .eq("user_id", user?.id);

    if (cuaErr) throw error(500, cuaErr.message);

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
