import type { RequestHandler } from "./$types";
import { redirect, error } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get("code");

  if (!code) {
    throw error(400, "Missing code");
  }

  const { data, error: err } = await supabase.auth.exchangeCodeForSession(code);
  if (err) {
    throw error(500, "Verification failed: " + err.message);
  }

  const { user } = data;

  if (!user) throw error(500, "Failed to retrieve user");

  const { error: createErr } = await supabase.from("profiles").insert({
    user_id: user.id,
    verified: true,
  });

  if (createErr) {
    throw error(500, "Failed to create profile: " + createErr.message);
  }

  throw redirect(303, `${url.origin}/auth/signup?step=profile`);
};
