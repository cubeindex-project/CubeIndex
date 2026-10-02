import type { LayoutServerLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";

export const load = (async ({ locals }) => {
  const { user, supabase, log } = locals;
  if (!user) redirect(303, "/auth/login");

  const { data: profile, error: err } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (err) {
    log.error({ err }, "Unable to load profile");
    throw error(500, "Unable to load profile");
  }

  if (profile.role !== "Admin" && profile.role !== "Moderator")
    redirect(303, "/staff/dashboard");
}) satisfies LayoutServerLoad;
