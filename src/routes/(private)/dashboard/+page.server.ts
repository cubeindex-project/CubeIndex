import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { logError } from "$lib/server/logError";

export const load = (async ({ locals }) => {
  const { supabase, user, log } = locals;
  if (!user) throw redirect(302, "/auth/login");

  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("username, display_name, user_id, profile_picture")
    .eq("user_id", user.id)
    .single();

  if (pErr) {
    return logError(500, "Unable to load profile", log, pErr);
  }

  const { data: cubeSubmissions, error: rsErr } = await supabase
    .from("cube_submissions")
    .select("id, name, image_url, ...submissions!inner(status, submitted_at)")
    .eq("submissions.submitted_by_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (rsErr) {
    return logError(
      500,
      "Failed to load recent submission activity",
      log,
      rsErr ?? new Error("Missing recent submission activity data"),
    );
  }

  return {
    profile,
    recent: {
      cubeSubmissions,
    },
    meta: {
      title: "Dashboard - CubeIndex",
      noindex: true,
    },
  };
}) satisfies PageServerLoad;
