import type { RequestHandler } from "./$types";
import { redirect } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals: { supabase } }) => {
  const { data } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: `${window.location.origin}/auth/signup-callback`,
    },
  });

  if (data.url) {
    redirect(307, data.url);
  }

  redirect(307, "/auth/error");
};
