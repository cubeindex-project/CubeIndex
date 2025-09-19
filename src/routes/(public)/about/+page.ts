import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import type { Profiles } from "$lib/components/dbTableTypes";
import { supabase } from "$lib/supabaseClient";

export const load = (async ({ setHeaders }) => {
  const { data: team, error: err } = await supabase
    .from("profiles")
    .select("*")
    .neq("role", "User")
    .neq("username", "cubeindex");

  if (err) throw error(500, err.message);

  const logoDesigner = team.find(
    (p: Profiles) => p.user_id === "b49da5bb-6d82-463e-b8ee-fd7c9feebde6"
  );

  const { data: features, error: fErr } = await supabase
    .from("features")
    .select("*");

  if (fErr) throw error(500, fErr.message);

  const currentFeatures = features.filter((f) => f.implemented === true);
  const futureFeatures = features.filter((f) => f.implemented === false);

  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  return { logoDesigner, team, features: currentFeatures, futureFeatures };
}) satisfies PageLoad;
