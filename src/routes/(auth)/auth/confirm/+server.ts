import type { RequestHandler } from "./$types";
import { redirect, error } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get("code");
  if (!code) throw error(400, "Missing code");

  // 1) Exchange the code for a session (sets cookies via the server client)
  //    For @supabase/auth-helpers-sveltekit this accepts a plain string `code`.
  //    If you use the client directly from supabase-js, it’s `{ code }`.
  const { data, error: authErr } = await supabase.auth.exchangeCodeForSession(code);
  if (authErr) throw error(500, "Verification failed: " + authErr.message);

  const user = data?.user;
  if (!user?.id) throw error(500, "No user returned from verification");

  // 2) Do we already have a profile?
  //    Use maybeSingle() so “no rows” isn’t an error.
  const { data: existingProfile, error: profileErr } = await supabase
    .from("profiles")
    .select("username")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileErr) throw error(500, "Profile lookup failed: " + profileErr.message);

  // 3) If a profile exists, mark it verified (idempotent) and route smartly.
  if (existingProfile) {
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ verified: true })
      .eq("user_id", user.id);
    if (updateErr) throw error(500, "Profile update failed: " + updateErr.message);

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
  if (createErr) throw error(500, "Failed to create profile: " + createErr.message);

  throw redirect(303, "/auth/signup?step=profile");
};
