import type { LayoutServerLoad } from "./$types";
import type { Profiles } from "$lib/components/dbTableTypes";

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
      log.error({ err }, "Error while retrieving profile in layout");
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
