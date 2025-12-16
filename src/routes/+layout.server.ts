import type { LayoutServerLoad } from "./$types";
import type { Profiles } from "$lib/components/dbTableTypes";
import { logError } from "$lib/server/logError";

export const load: LayoutServerLoad = async ({
  locals: { safeGetSession, supabase, log },
  cookies,
}) => {
  const { session, user } = await safeGetSession();

  let profile: Profiles | null = null;

  if (user) {
    const { data, error: err } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (err) {
      logError(
        Number(err.code),
        "Error while retrieving profile in layout",
        log,
        err,
        false,
      );
      profile = null;
    }

    profile = data;
  }

  return {
    profile,
    session,
    cookies: cookies.getAll(),
  };
};
