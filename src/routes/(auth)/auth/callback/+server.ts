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
      500,
      "Missing code parameter",
      log,
      new Error("Missing code parameter"),
      false,
    );
    redirect(303, "/?toast_error=Missing+code+parameter");
  }

  const { data, error: err } = await supabase.auth.exchangeCodeForSession(code);
  if (err) {
    logError(500, "Failed to exchange code for session", log, err, false);
    redirect(303, "/?toast_error=Failed+to+exchange+code+for+session");
  }

  const { user } = data;

  const { data: existingProfile, error: profileFetchError } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileFetchError) {
    logError(500, "Failed to retrieve profile", log, profileFetchError, false);
    redirect(303, `/?toast_error=Failed+to+retrieve+profile`);
  }

  if (existingProfile?.onboarded) {
    redirect(303, "/dashboard");
  }

  const { error: profileUpdateError } = await supabase
    .from("profiles")
    .update({ verified: true })
    .eq("user_id", user.id);

  if (profileUpdateError) {
    logError(500, "Failed to update profile", log, profileUpdateError, false);
    redirect(303, `/?toast_error=Failed+to+update+profile`);
  }

  redirect(303, "/auth/complete-profile");
};
