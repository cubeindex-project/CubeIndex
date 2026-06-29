import { logError } from "$lib/server/logError";
import type { RequestHandler } from "./$types";
import { redirect } from "@sveltejs/kit";

export const GET: RequestHandler = async ({
  url,
  locals: { supabase, log },
}) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${url.origin}/auth/callback`,
    },
  });

  if (error) {
    logError(500, "Failed to initiate Google login", log, error);
  }

  redirect(307, data.url);
};
