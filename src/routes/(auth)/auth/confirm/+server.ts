import type { RequestHandler } from "./$types";
import { redirect } from "@sveltejs/kit";
import { logError } from "$lib/server/logError";

export const GET: RequestHandler = async ({ url, locals }) => {
  const { supabase, log } = locals;
  const code = url.searchParams.get("code");
  if (!code) {
    logError(
      400,
      "Missing code parameter",
      log,
      new Error("Missing code parameter"),
    );
  }

  const { data, error: authErr } =
    await supabase.auth.exchangeCodeForSession(code);

  if (authErr) {
    logError(500, "Failed to exchange code for session", log, authErr);
  }

  const user = data.user;

  const { data: existingProfile, error: profileErr } = await supabase
    .from("profiles")
    .select("username, onboarded")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileErr) {
    logError(500, "Failed to check profile", log, profileErr);
  }

  if (!existingProfile) {
    logError(
      400,
      "No existing profile was found",
      log,
      new Error("No existing profile was found"),
    );
  }

  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ verified: true })
    .eq("user_id", user.id);

  if (updateErr) {
    logError(500, "Failed to update profile", log, updateErr);
  }

  if (!existingProfile.onboarded) {
    redirect(303, "/auth/complete-profile");
  }

  redirect(303, `/user/${existingProfile.username}`);
};
