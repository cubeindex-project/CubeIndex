import type { LayoutServerLoad } from "./$types";
import type { Profiles } from "$lib/components/dbTableTypes";
import { PUBLIC_DEPLOYMENT_CHANNEL } from "$env/static/public";
import { redirect } from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({
  locals: { safeGetSession, supabase, log },
  cookies,
  url: { pathname },
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

  const isBetaPages =
    pathname === "/auth/login" ||
    pathname === "/beta" ||
    pathname === "/discord";

  const isBetaDeployment = PUBLIC_DEPLOYMENT_CHANNEL === "beta";
  const hasBetaAccess = profile?.beta_access ?? false;

  if (isBetaDeployment && !isBetaPages && !hasBetaAccess) {
    throw redirect(303, "/beta");
  }

  return {
    profile,
    session,
    cookies: cookies.getAll(),
  };
};
