import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { logError } from "$lib/server/logError";

export const load = (async ({ locals: { supabase, user, log } }) => {
  if (!user) throw redirect(302, "/auth/login");

  const { data: cubeSubmissions, error } = await supabase
    .from("cube_submissions")
    .select(
      `
      *,
      ...submissions!inner(*)
    `,
    )
    .eq("submissions.submitted_by_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return logError(500, "Failed to fetch cube submissions", log, error);
  }

  return {
    cubeSubmissions,
    // vendorSubmissions: vendorResult.data,
    meta: {
      title: "My Submissions - CubeIndex",
      noindex: true,
    },
  };
}) satisfies PageServerLoad;
