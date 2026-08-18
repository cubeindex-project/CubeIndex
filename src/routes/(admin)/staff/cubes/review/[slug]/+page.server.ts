import { error } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { fail, message, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { updateSubmissionStatus } from "$lib/schemas/submissionStatus";
import type { TablesUpdate } from "$lib/types/database.types";

export const load = (async ({ params, locals: { supabase, log } }) => {
  const slug = params.slug;

  const { data: cube, error: cubeErr } = await supabase
    .from("v_detailed_cube_models")
    .select(
      "*,verifier:profiles!verified_by_id(display_name, username),submitter:profiles!submitted_by_id(display_name, username)",
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
    supabase.from("cube_vendor_links").select("*").eq("cube_slug", slug),
    supabase.from("cubes_model_features").select("feature").eq("cube", slug),
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
  default: async ({ request, locals: { supabase, user, log } }) => {
    const form = await superValidate(request, zod4(updateSubmissionStatus));
    if (!form.valid) {
      return message(form, "Please fix the highlighted fields and try again.", {
        status: 400,
      });
    }

    if (!user) {
      return fail(401, {
        form,
        message: "User is not logged-in",
      });
    }

    const { ID: cube_id, status } = form.data;
    const note = form.data.status === "Rejected" ? form.data.staffNote : null;

    const payload: TablesUpdate<"cube_models"> = {
      status,
      staff_note: note,
      verified_by_id: user.id,
      verified_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("cube_models")
      .update(payload)
      .eq("id", cube_id);

    if (error) {
      log.error({ err: error.message }, "Failed to update cube status");
      return setError(
        form,
        "An error occurred while updating the cube status",
        {
          status: 500,
        },
      );
    }

    return message(form, "Status updated successfully.");
  },
};
