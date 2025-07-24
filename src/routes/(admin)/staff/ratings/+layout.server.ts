import type { LayoutServerLoad } from "./$types";
import { redirect, error } from "@sveltejs/kit";

export const load = (async ({ locals: { user, supabase } }) => {
  if (!user) redirect(303, "/auth/login");

  const { data: profile, error: err } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (err) throw error(500, err.message);

  if (profile.role !== "Admin" && profile.role !== "Moderator")
    redirect(303, "/staff/dashboard");
}) satisfies LayoutServerLoad;
