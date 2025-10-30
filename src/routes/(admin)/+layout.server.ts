import { logError } from "$lib/server/logError";
import type { LayoutServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load = (async ({ locals: { supabase, user, log } }) => {
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
      err,
      false
    );

  if (profile.role === "User") redirect(303, "/");

  return { profile, user };
}) satisfies LayoutServerLoad;
