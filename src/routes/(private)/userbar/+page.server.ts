import type { PageServerLoad } from "./$types";
import { logError } from "$lib/server/logError";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({
  locals: { user, supabase, log },
}) => {
  if (!user) throw redirect(302, "/auth/login");

  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("user_id", user.id)
    .single();

  if (pErr) {
    return logError(500, "Unable to load your profile", log, pErr);
  }

  return {
    username: profile.username,
    displayName: profile.display_name,
    meta: { title: "Userbar - CubeIndex", noindex: true },
  };
};
