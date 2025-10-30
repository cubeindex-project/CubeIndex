import type { RequestHandler } from "./$types";
import { redirect } from "@sveltejs/kit";
import { logError } from "$lib/server/logError";

export const GET: RequestHandler = async ({ url, locals }) => {
  const { supabase, log } = locals;
  const code = url.searchParams.get("code") as string;
  const next = url.searchParams.get("next") ?? "/";

  if (!code) {
    return logError(
      500,
      "Authorization code is missing.",
      log,
      new Error("Authorization code not provided")
    );
  }

  const { data, error: err } = await supabase.auth.exchangeCodeForSession(code);
  if (err) {
    return logError(500, "Authentication failed", log, err);
  }

  const { user } = data;
  if (!user) {
    return logError(500, "User data is missing.", log, new Error("User not returned after authentication"));
  }

  // Check if a profile already exists for this user
  const { data: existingProfile, error: profileFetchError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profileFetchError && existingProfile) {
    // Profile exists, just redirect
    const redirectTo = next.startsWith("/") ? next : `/${next}`;
    throw redirect(303, redirectTo);
  }

  const userId = data.user?.id;

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      user_id: userId,
      verified: true,
    });

  if (profileError) {
    return logError(500, "Failed to create profile", log, profileError);
  }

  throw redirect(303, `${url.origin}/auth/signup?step=profile`);
};
