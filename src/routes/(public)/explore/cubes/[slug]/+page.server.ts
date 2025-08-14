import { configCatClient } from "$lib/configcatClient";
import type { Profiles } from "$lib/components/dbTableTypes";

export const load = async ({ locals, setHeaders }) => {
  let databaseAvailability: boolean = true;
  let cubesAvailability: boolean = true;

  configCatClient.getValueAsync("database", false).then((value) => {
    databaseAvailability = value;
  });

  configCatClient.getValueAsync("cubes", false).then((value) => {
    cubesAvailability = value;
  });

  let profile: Profiles = {} as Profiles;

  if (locals.user?.id) {
    const { data, error: pErr } = await locals.supabase
      .from("profiles")
      .select("*")
      .eq("user_id", locals.user?.id)
      .single();

    if (pErr) {
      throw new Error(`500, Failed to fetch profiles: ${pErr.message}`);
    }

    profile = data;
  }

  setHeaders({
    "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
  });

  return { databaseAvailability, cubesAvailability, profile };
};
