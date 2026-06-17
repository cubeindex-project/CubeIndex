import type { LayoutServerLoad } from "./$types";
import { logError } from "$lib/server/logError";
import { dev } from "$app/environment";
import type { Tables } from "$lib/types/database.types";

export const load: LayoutServerLoad = async ({
  locals: { safeGetSession, supabase, log },
  cookies,
  url,
}) => {
  const { session, user } = await safeGetSession();

  let profile: Tables<"profiles"> | null = null;

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
    }

    profile = data;
  }

  const isDevelopmentEnvironment = !dev;

  return {
    profile,
    user,
    session,
    cookies: cookies.getAll(),
    isDevelopmentEnvironment,
  };
};
