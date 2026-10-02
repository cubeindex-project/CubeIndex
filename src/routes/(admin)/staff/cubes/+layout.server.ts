import type { LayoutServerLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";

export const load = (async ({ locals: { user, supabase, log } }) => {
  if (!user) redirect(303, "/auth/login");

  const { data: profile, error: err } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (err) {
    log.error(
      {
        err,
      },
      "An error occurred while retrieving your profile",
    );
    throw error(
      Number(err.code),
      "An error occurred while retrieving your profile",
    );
  }

  if (profile.role !== "Admin" && profile.role !== "Database Manager")
    redirect(303, "/staff/dashboard");
}) satisfies LayoutServerLoad;
