import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals: { supabase, user, log } }) => {
  if (!user) throw redirect(302, "/auth/login");

  const { data: cubeSubmissions, error: submissionsError } = await supabase
    .from("cube_submissions")
    .select("*, ...submissions!inner(*)")
    .eq("submissions.submitted_by_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (submissionsError) {
    log.error({
      err: submissionsError,
      msg: "Failed to fetch cube submissions",
    });
    throw error(500, "Failed to fetch cube submissions");
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
