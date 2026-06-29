import type { RequestHandler } from "./$types";
import { redirect } from "@sveltejs/kit";
import { logError } from "$lib/server/logError";

export const GET: RequestHandler = async ({
  url,
  locals: { supabase, log },
}) => {
  const error = url.searchParams.get("error");
  const errorCode = url.searchParams.get("error_code");
  const errorDescription = url.searchParams.get("error_description");
  if (error || errorDescription) {
    const errorMessage = errorDescription || error || "An error occurred!";
    logError(
      400,
      errorMessage,
      log,
      {
        error,
        errorCode,
        errorDescription,
      },
      false,
    );
    redirect(303, `/?toast_error=${encodeURIComponent(errorMessage)}`);
  }

  const code = url.searchParams.get("code");
  if (!code) {
    logError(
      400,
      "Missing code parameter",
      log,
      new Error("Missing code parameter"),
      false,
    );
    redirect(303, "/?toast_error=Missing+code+parameter");
  }

  const { data, error: authErr } =
    await supabase.auth.exchangeCodeForSession(code);

  if (authErr) {
    logError(500, "Failed to exchange code for session", log, authErr, false);
    redirect(303, "/?toast_error=Failed+to+exchange+code+for+session");
  }

  const user = data.user;

  const { data: existingProfile, error: profileErr } = await supabase
    .from("profiles")
    .select("username, onboarded")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileErr) {
    logError(500, "Failed to retrieve profile", log, profileErr, false);
    redirect(303, "/?toast_error=Failed+to+retrieve+profile");
  }

  if (!existingProfile) {
    logError(
      400,
      "No existing profile was found",
      log,
      new Error("No existing profile was found"),
      false,
    );
    redirect(303, "/?toast_error=No+existing+profile+was+found");
  }

  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ verified: true })
    .eq("user_id", user.id);

  if (updateErr) {
    logError(500, "Failed to update profile", log, updateErr, false);
    redirect(303, "/?toast_error=Failed+to+update+profile");
  }

  if (!existingProfile.onboarded) {
    redirect(303, "/auth/complete-profile");
  }

  redirect(303, `/user/${existingProfile.username}`);
};
