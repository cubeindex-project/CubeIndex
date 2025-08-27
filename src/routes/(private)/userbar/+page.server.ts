import type { PageServerLoad } from "./$types";
import { redirect, error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals }) => {
  // Require auth
  const {
    data: { user },
  } = await locals.supabase.auth.getUser();

  if (!user) throw redirect(302, "/login");

  // Fetch the profile to get the username
  const { data: profile, error: pErr } = await locals.supabase
    .from("profiles")
    .select("username, display_name")
    .eq("user_id", user.id)
    .single();

  if (pErr) throw error(500, "Unable to load your profile:" + pErr.message);

  return {
    username: profile.username,
    display_name: profile.display_name ?? profile.username,
  };
};
