import type { RequestHandler } from "./$types";
import { redirect } from "@sveltejs/kit";
import { logError } from "$lib/server/logError";

export const GET: RequestHandler = async ({
  url,
  locals: { supabase, log },
}) => {
  const code = url.searchParams.get("code");
  if (!code) {
    logError(
      500,
      "Authorization code is missing.",
      log,
      new Error("Authorization code not provided"),
    );
  }

  const { data, error: err } = await supabase.auth.exchangeCodeForSession(code);
  if (err) {
    logError(500, "Authentication failed", log, err);
  }

  const { user } = data;
  if (!user) {
    logError(
      500,
      "User data is missing.",
      log,
      new Error("User not returned after authentication"),
    );
  }

  const { data: existingProfile, error: profileFetchError } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileFetchError) {
    logError(500, "Failed to fetch profile", log, profileFetchError);
  }

  if (existingProfile?.onboarded) {
    redirect(303, "/dashboard");
  }

  redirect(303, "/auth/complete-profile");
};
