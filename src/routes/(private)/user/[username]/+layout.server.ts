import { error } from "@sveltejs/kit";

export const load = async ({ params, locals }) => {
  const { username } = params;

  const { data: profile, error: err } = await locals.supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (err) throw error(500, err.message);

  if (!profile) throw error(404, "User not found");

  const { data: following, error: followErr } = await locals.supabase
    .from("user_follows")
    .select("*")
    .eq("follower_id", locals.user?.id)
    .eq("following_id", profile.user_id);

  if (followErr) throw error(500, followErr.message);

  return { profile, following };
};
