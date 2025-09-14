import type { LayoutServerLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";

export const load = (async ({ locals: { supabase, user } }) => {
  if (!user) redirect(303, "/auth/login");

  const { data: profile, error: err } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (err) throw error(500, err.message);

  if (profile.role === "User") redirect(303, "/");

  return { profile, user };
}) satisfies LayoutServerLoad;
