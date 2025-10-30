import type { LayoutServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { logError } from "$lib/server/logError";

export const load = (async ({ locals }) => {
  const { user, supabase, log } = locals;
  if (!user) redirect(303, "/auth/login");

  const { data: profile, error: err } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (err) {
    return logError(500, "Unable to load profile", log, err);
  }

  if (profile.role !== "Admin" && profile.role !== "Moderator")
    redirect(303, "/staff/dashboard");
}) satisfies LayoutServerLoad;
