import { logError } from "$lib/server/logError";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals: { user, supabase, log } }) => {
  if (!user) redirect(303, "/auth/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (error) {
    return logError(500, "Unable to load the staff profile", log, error);
  }
  if (profile.role !== "Admin" && profile.role !== "Database Manager") {
    redirect(303, "/staff/dashboard");
  }
}) satisfies LayoutServerLoad;
