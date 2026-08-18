import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { logError } from "$lib/server/logError";

export const load = (async ({ locals: { supabase, user, log } }) => {
  if (!user) throw redirect(302, "/auth/login");

  const [cubeResult, vendorResult] = await Promise.all([
    supabase
      .from("v_detailed_cube_models")
      .select("*")
      .eq("submitted_by_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("vendors")
      .select("*")
      .eq("submitted_by_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (cubeResult.error) {
    return logError(
      500,
      "Failed to load your cube submissions",
      log,
      cubeResult.error,
    );
  }
  if (vendorResult.error) {
    return logError(
      500,
      "Failed to load your vendor submissions",
      log,
      vendorResult.error,
    );
  }

  return {
    cubeSubmissions: cubeResult.data,
    vendorSubmissions: vendorResult.data,
    meta: {
      title: "My Submissions - CubeIndex",
      noindex: true,
    },
  };
}) satisfies PageServerLoad;
