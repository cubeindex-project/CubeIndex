import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { logError } from "$lib/server/logError";

export const load = (async ({ locals: { supabase, user, log } }) => {
  if (!user) throw redirect(302, "/auth/login");

  const { data: submissions, error } = await supabase
    .from("v_detailed_cube_models")
    .select("*")
    .eq("submitted_by_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return logError(500, "Failed to load your cube submissions", log, error);
  }

  return {
    submissions,
    meta: {
      title: "My Submissions - CubeIndex",
      noindex: true,
    },
  };
}) satisfies PageServerLoad;
