import type { PageServerLoad } from "./$types";
import { clientLogError } from "$lib/logger/clientLogError";
import { clientLogger } from "$lib/logger/client";
import type { Tables } from "$lib/types/database.types";

export const load = (async ({ setHeaders, parent, locals: { supabase } }) => {
  const { user } = await parent();

  const { data: achievements, error: err } = await supabase
    .from("v_achievement_rarity")
    .select("*")
    .order("name", { ascending: true });

  if (err) {
    return clientLogError("Unable to load achievements", clientLogger, err);
  }

  let currentUserAchievements: Tables<"user_achievements">[] = [];

  if (user) {
    const { data, error: cuaErr } = await supabase
      .from("user_achievements")
      .select("*")
      .eq("user_id", user.id);

    if (cuaErr) {
      return clientLogError(
        "Unable to load awarded achievements",
        clientLogger,
        cuaErr,
      );
    }

    currentUserAchievements = data;
  }

  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  return {
    achievements,
    currentUserAchievements,
    meta: {
      title: "Achievements - CubeIndex",
      description:
        "Browse achievements on CubeIndex. Discover available ones, read their requirements, and see which milestones you can unlock next.",
    },
  };
}) satisfies PageServerLoad;
