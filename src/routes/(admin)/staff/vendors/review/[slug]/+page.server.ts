import { createSubmissionStatusAction } from "$lib/server/staff/createSubmissionStatusAction";
import { error } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async ({ params, locals: { supabase, log } }) => {
  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select(
      "*,submitter:profiles!submitted_by_id(display_name),verifier:profiles!verified_by_id(display_name)",
    )
    .eq("slug", params.slug)
    .maybeSingle();

  if (vendorError) {
    log.error({ err: vendorError.message }, "Failed to load vendor submission");
    throw error(500, "Failed to load vendor submission");
  }
  if (!vendor) throw error(404, "Vendor not found");

  return {
    vendor,
    meta: { title: "Review Vendor - CubeIndex", noindex: true },
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: createSubmissionStatusAction(
    "vendor",
    async ({ supabase, id, payload }) => {
      const { error } = await supabase
        .from("vendors")
        .update({
          status: payload.status,
          staff_note: payload.reviewerNote,
          verified_by_id: payload.reviewedByID,
          verified_at: payload.reviewedAt,
        })
        .eq("id", id);
      return error;
    },
  ),
};
