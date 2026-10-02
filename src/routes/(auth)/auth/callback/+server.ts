import type { RequestHandler } from "./$types";
import { redirect } from "@sveltejs/kit";

export const GET: RequestHandler = async ({
  url,
  locals: { supabase, log },
}) => {
  const error = url.searchParams.get("error");
  const errorCode = url.searchParams.get("error_code");
  const errorDescription = url.searchParams.get("error_description");
  if (error || errorDescription) {
    const errorMessage = errorDescription || error || "An error occurred!";
    log.error(
      {
        err: {
          error,
          errorCode,
          errorDescription,
        },
      },
      errorMessage,
    );
    redirect(303, `/?toast_error=${encodeURIComponent(errorMessage)}`);
  }

  const code = url.searchParams.get("code");
  if (!code) {
    log.error(
      {
        err: new Error("Missing code parameter"),
      },
      "Missing code parameter",
    );
    redirect(303, "/?toast_error=Missing+code+parameter");
  }

  const { data, error: err } = await supabase.auth.exchangeCodeForSession(code);
  if (err) {
    log.error({ err }, "Failed to exchange code for session");
    redirect(303, "/?toast_error=Failed+to+exchange+code+for+session");
  }

  const { user } = data;

  const { data: existingProfile, error: profileFetchError } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileFetchError) {
    log.error({ err: profileFetchError }, "Failed to retrieve profile");
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
    log.error({ err: profileUpdateError }, "Failed to update profile");
    redirect(303, `/?toast_error=Failed+to+update+profile`);
  }

  redirect(303, "/auth/complete-profile");
};
