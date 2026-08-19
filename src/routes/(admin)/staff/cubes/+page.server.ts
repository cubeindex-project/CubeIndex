import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals: { supabase, log } }) => {
  const { data: cubeSubmissions, error: cubeSubmissionsError } = await supabase
    .from("cube_submissions")
    .select(
      "*,submission:submissions!inner(*,submitter:profiles!submitted_by_id(display_name))",
    )
    .order("created_at", { ascending: false });

  if (cubeSubmissionsError) {
    log.error(
      { err: cubeSubmissionsError.message },
      "Failed to load cube submissions",
    );
    throw error(500, "Failed to load cube submissions");
  }

  return {
    cubeSubmissions,
    meta: { title: "Manage Cubes - CubeIndex", noindex: true },
  };
}) satisfies PageServerLoad;
