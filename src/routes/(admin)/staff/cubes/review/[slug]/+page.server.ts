import { error } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { createSubmissionStatusAction } from "$lib/server/staff/createSubmissionStatusAction";

export const load = (async ({ params, locals: { supabase, log } }) => {
  const slug = params.slug;

  const { data: cube, error: cubeErr } = await supabase
    .from("v_detailed_cube_models")
    .select(
      "*,submitter:profiles!submitted_by_id(display_name),verifier:profiles!verified_by_id(display_name)",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (cubeErr) {
    log.error({ err: cubeErr.message }, "Failed to fetch cubes");
    throw error(500, "Failed to fetch cubes");
  }

  if (!cube) {
    throw error(404, "Cube not found");
  }

  const [
    { data: vendorLinks, error: vlError },
    { data: features, error: cubeFeaturesErr },
  ] = await Promise.all([
    supabase
      .from("cube_vendor_links")
      .select("vendor_name,price,available,url")
      .eq("cube_slug", slug),
    supabase.from("cube_model_features").select("feature").eq("cube", slug),
  ]);

  if (vlError) {
    log.error({ err: vlError.message }, "Failed to load vendor links");
    throw error(500, "Failed to load vendor links");
  }
  if (cubeFeaturesErr) {
    log.error(
      { err: cubeFeaturesErr.message },
      "Failed to fetch the current cube features",
    );
    throw error(500, "Failed to fetch the current cube features");
  }

  return {
    cube,
    vendorLinks,
    features,
    meta: {
      title: "Review Submission - CubeIndex",
    },
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: createSubmissionStatusAction(
    "cube",
    async ({ supabase, id, payload }) => {
      const { error } = await supabase
        .from("cube_models")
        .update(payload)
        .eq("id", id);
      return error;
    },
  ),
};
