import type { LayoutServerLoad } from "./$types";
import type { Profiles } from "$lib/components/dbTableTypes";
import {
  PUBLIC_BETA_APP_URL,
  PUBLIC_DEPLOYMENT_CHANNEL,
} from "$env/static/public";
import { redirect } from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({
  locals: { safeGetSession, supabase, log },
  cookies,
  url,
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

  const pathname = url.pathname;
  const origin = url.origin;
  const href = url.toString();
  const queryIndex = href.indexOf("?");
  const hashIndex = href.indexOf("#");
  const hasQuery = queryIndex !== -1;
  const queryString = hasQuery
    ? href.slice(
        queryIndex,
        hashIndex !== -1 && hashIndex > queryIndex ? hashIndex : undefined
      )
    : "";
  const isBetaPages = pathname === "/auth/login" || pathname === "/beta";

  const isBetaDeployment = PUBLIC_DEPLOYMENT_CHANNEL === "beta";
  const hasBetaAccess = profile?.beta_access ?? false;
  const betaBaseUrl = PUBLIC_BETA_APP_URL?.trim();

  if (!isBetaDeployment && hasBetaAccess && betaBaseUrl) {
    const betaUrl = new URL(pathname + queryString, betaBaseUrl);
    if (
      betaUrl.origin !== origin ||
      betaUrl.pathname !== pathname ||
      betaUrl.search !== queryString
    ) {
      throw redirect(303, betaUrl.href);
    }
  }

  if (isBetaDeployment && !isBetaPages && !hasBetaAccess) {
    throw redirect(303, "/beta");
  }

  return {
    profile,
    session,
    cookies: cookies.getAll(),
  };
};
