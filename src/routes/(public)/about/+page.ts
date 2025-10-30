import type { PageLoad } from "./$types";
import type { Profiles } from "$lib/components/dbTableTypes";
import { supabase } from "$lib/supabaseClient";
import { clientLogError } from "$lib/logger/clientLogError";
import { clientLogger } from "$lib/logger/client";

export const load = (async ({ setHeaders }) => {
  const { data: team, error: err } = await supabase
    .from("profiles")
    .select("*")
    .neq("role", "User")
    .neq("username", "cubeindex");

  if (err) {
    return clientLogError("Unable to load team profiles", clientLogger, err);
  }

  const logoDesigner = team.find(
    (p: Profiles) => p.user_id === "b49da5bb-6d82-463e-b8ee-fd7c9feebde6"
  );

  const { data: features, error: fErr } = await supabase
    .from("features")
    .select("*");

  if (fErr) {
    return clientLogError("Unable to load feature list", clientLogger, fErr);
  }

  const currentFeatures = features.filter((f) => f.implemented === true);
  const futureFeatures = features.filter((f) => f.implemented === false);

  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  return { logoDesigner, team, features: currentFeatures, futureFeatures };
}) satisfies PageLoad;
