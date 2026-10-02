import type { RequestHandler } from "./$types";
import { error, redirect } from "@sveltejs/kit";

export const GET: RequestHandler = async ({
  url,
  locals: { supabase, log },
}) => {
  const { data, error: authError } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${url.origin}/auth/callback`,
    },
  });

  if (authError) {
    log.error({ err: authError, msg: "Failed to initiate Google login" });
    throw error(500, "Failed to initiate Google login");
  }

  redirect(307, data.url);
};
