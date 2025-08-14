import type { Profiles } from "$lib/components/dbTableTypes";
import { supabase } from "$lib/supabaseClient";
import { error } from "@sveltejs/kit";

export const load = async ({ setHeaders }) => {
  const { data: profiles, error: err } = await supabase
    .from("profiles")
    .select("*");

  if (err) throw error(500, err.message);

  const team = profiles.filter(
    (p: Profiles) => p.role !== "User" && p.username !== "cubeIndex"
  );

  const logoDesigner = profiles.find(
    (p: Profiles) => p.user_id === "b49da5bb-6d82-463e-b8ee-fd7c9feebde6"
  );

  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  return { profiles, logoDesigner, team };
};
