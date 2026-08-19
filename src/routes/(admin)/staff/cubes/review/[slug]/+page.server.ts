import { error } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { updateSubmissionStatus } from "$lib/schemas/submissionStatus";
import { fail } from "@sveltejs/kit";
import { rejectSubmission } from "$lib/server/staff/rejectSubmission";
import { approveSubmission } from "$lib/server/staff/approveSubmission";

export const load = (async ({ params, locals: { supabase, log } }) => {
  const submissionID = Number(params.slug);
  if (!Number.isSafeInteger(submissionID) || submissionID < 1) {
    throw error(404, "Cube submission not found");
  }

  const { data: cube, error: cubeError } = await supabase
    .from("cube_submissions")
    .select(
      `
        *,
        submission:submissions!inner(
          *,
          submitter:profiles!submitted_by_id(display_name),
          reviewer:profiles!reviewed_by_id(display_name)
        ),
        brand:brands!brand_id(name),
        type:cube_types!type_id(name),
        series:cube_series!series_id(name),
        relatedCube:cube_models!related_to_id(name),
        targetCube:cube_models!target_cube_id(slug,name)
      `,
    )
    .eq("submission_id", submissionID)
    .maybeSingle();

  if (cubeError) {
    log.error({ err: cubeError.message }, "Failed to load cube submission");
    throw error(500, "Failed to load cube submission");
  }
  if (!cube) throw error(404, "Cube submission not found");

  const [featuresResult, vendorLinksResult] = await Promise.all([
    supabase
      .from("cube_submission_features")
      .select("...cube_features!feature_id(label)")
      .eq("cube_submission_id", cube.id),
    supabase
      .from("cube_vendor_link_submissions")
      .select("price,available,url,vendor:vendors!vendor_id(name)")
      .eq("cube_submission_id", cube.id),
  ]);

  if (featuresResult.error) {
    log.error(
      { err: featuresResult.error.message },
      "Failed to load cube submission features",
    );
    throw error(500, "Failed to load cube submission features");
  }
  if (vendorLinksResult.error) {
    log.error(
      { err: vendorLinksResult.error.message },
      "Failed to load cube submission vendor links",
    );
    throw error(500, "Failed to load cube submission vendor links");
  }

  return {
    cube,
    features: featuresResult.data,
    vendorLinks: vendorLinksResult.data,
    meta: { title: "Review Cube Submission - CubeIndex", noindex: true },
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
      return fail(401, { form, message: "User is not logged in" });
    }

    const { submissionID, status } = form.data;

    if (status === "Approved") {
      await approveSubmission(submissionID, supabase, log);
    } else {
      await rejectSubmission(submissionID, form.data.staffNote, supabase, log);
    }

    return message(form, "Status updated successfully.");
  },
};
