import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { logError } from "$lib/server/logError";

/**
 * Load data for the authenticated user dashboard.
 * - Requires a valid session; otherwise redirects to `/auth/login`.
 * - Returns lightweight profile info and key counts for quick overview.
 */
export const load = (async ({ locals }) => {
  const { supabase, user, log } = locals;
  if (!user) throw redirect(302, "/auth/login");

  // Fetch profile (username, display name, role) for greetings and links
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("username, display_name, user_id, profile_picture")
    .eq("user_id", user.id)
    .single();

  if (pErr) {
    return logError(500, "Unable to load profile", log, pErr);
  }

  // Recent activity (lightweight)
  const { data: submissions, error: rsErr } = await supabase
    .from("v_detailed_cube_models")
    .select("slug, name, image_url, status, created_at")
    .eq("submitted_by_id", user.id)
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
      submissions,
    },
    meta: {
      title: "Dashboard - CubeIndex",
      noindex: true,
    },
  };
}) satisfies PageServerLoad;
