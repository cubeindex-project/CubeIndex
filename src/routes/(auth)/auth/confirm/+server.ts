import type { RequestHandler } from "./$types";
import { redirect } from "@sveltejs/kit";
import { logError } from "$lib/server/logError";

export const GET: RequestHandler = async ({ url, locals }) => {
  const { supabase, log } = locals;
  const code = url.searchParams.get("code");
  if (!code) {
    return logError(400, "Verification link is invalid", log, new Error("Missing code parameter"));
  }

  // 1) Exchange the code for a session (sets cookies via the server client)
  //    For @supabase/auth-helpers-sveltekit this accepts a plain string `code`.
  //    If you use the client directly from supabase-js, it’s `{ code }`.
  const { data, error: authErr } = await supabase.auth.exchangeCodeForSession(code);
  if (authErr) {
    return logError(500, "Verification failed", log, authErr);
  }

  const user = data?.user;
  if (!user?.id) {
    return logError(500, "Verification failed", log, new Error("User missing after verification"));
  }

  // 2) Do we already have a profile?
  //    Use maybeSingle() so “no rows” isn’t an error.
  const { data: existingProfile, error: profileErr } = await supabase
    .from("profiles")
    .select("username")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileErr) {
    return logError(500, "Failed to check profile", log, profileErr);
  }

  // 3) If a profile exists, mark it verified (idempotent) and route smartly.
  if (existingProfile) {
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ verified: true })
      .eq("user_id", user.id);
    if (updateErr) {
      return logError(500, "Failed to update profile", log, updateErr);
    }

    // If username is missing, continue onboarding instead of /user/null
    if (!existingProfile.username) {
      throw redirect(303, "/auth/signup?step=profile");
    }

    throw redirect(303, `/user/${existingProfile.username}`);
  }

  // 4) No profile yet — create a minimal verified record, then continue onboarding.
  const { error: createErr } = await supabase
    .from("profiles")
    .insert({ user_id: user.id, verified: true });
  if (createErr) {
    return logError(500, "Failed to create profile", log, createErr);
  }

  throw redirect(303, "/auth/signup?step=profile");
};
