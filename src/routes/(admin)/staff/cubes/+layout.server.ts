import { logError } from "$lib/server/logError";
import type { LayoutServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load = (async ({ locals: { user, supabase, log } }) => {
  if (!user) redirect(303, "/auth/login");

  const { data: profile, error: err } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (err) 
      logError(
        Number(err.code),
        "An error occurred while retrieving your profile",
        log,
        err
      );

  if (profile.role !== "Admin" && profile.role !== "Database Manager")
    redirect(303, "/staff/dashboard");
}) satisfies LayoutServerLoad;
