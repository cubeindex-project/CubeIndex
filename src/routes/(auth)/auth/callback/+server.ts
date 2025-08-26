import type { RequestHandler } from "./$types";
import { redirect, error } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get("code") as string;
  const next = url.searchParams.get("next") ?? "/";

  if (!code) throw error(500, "Authorization code is missing.");

  const { data, error: err } = await supabase.auth.exchangeCodeForSession(code);
  if (err) throw error(500, err.message);

  const { user } = data;
  if (!user) throw error(500, "User data is missing.");

  // Check if a profile already exists for this user
  const { data: existingProfile, error: profileFetchError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profileFetchError && existingProfile) {
    // Profile exists, just redirect
    const redirectTo = next.startsWith("/") ? next : `/${next}`;
    throw redirect(303, redirectTo);
  }

  const userId = data.user?.id;

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      user_id: userId,
      verified: true,
    });

  if (profileError) throw error(500, profileError.message);

  throw redirect(303, `${url.origin}/auth/signup?step=profile`);
};
