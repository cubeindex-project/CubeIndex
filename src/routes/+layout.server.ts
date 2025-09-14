import type { LayoutServerLoad } from "./$types";
import type { Profiles } from "$lib/components/dbTableTypes";

export const load: LayoutServerLoad = async ({
  locals: { safeGetSession, supabase },
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
      console.error(500, "Error while retrieving profile in layout: " + err.message);
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
