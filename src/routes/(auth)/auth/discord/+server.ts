import type { RequestHandler } from "./$types";
import { error, redirect } from "@sveltejs/kit";

export const GET: RequestHandler = async ({
  url,
  locals: { supabase, log },
}) => {
  const { data, error: authError } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: `${url.origin}/auth/callback`,
    },
  });

  if (authError) {
    log.error({ err: authError }, "Failed to initiate Discord login");
    throw error(500, "Failed to initiate Discord login");
  }

  redirect(307, data.url);
};
