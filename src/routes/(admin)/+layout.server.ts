import type { LayoutServerLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";

export const load = (async ({ locals: { supabase, user, log } }) => {
  if (!user) redirect(303, "/auth/login");

  const { data: profile, error: err } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (err) {
    log.error({
      err,
      msg: "An error occurred while retrieving your profile",
    });
    throw error(500, "An error occurred while retrieving your profile");
  }

  if (profile.role === "User") redirect(303, "/");

  return { profile, user, meta: { noindex: true } };
}) satisfies LayoutServerLoad;
