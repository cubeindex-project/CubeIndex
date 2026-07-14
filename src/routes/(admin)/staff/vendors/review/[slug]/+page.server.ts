import { updateSubmissionStatus } from "$lib/schemas/submissionStatus";
import type { TablesUpdate } from "$lib/types/database.types";
import { error } from "@sveltejs/kit";
import { fail, message, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async ({ params, locals: { supabase, log } }) => {
  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select(
      "*,submitter:profiles!submitted_by_id(display_name,username),verifier:profiles!verified_by_id(display_name,username)",
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
  default: async ({ request, locals: { supabase, user, log } }) => {
    const form = await superValidate(request, zod4(updateSubmissionStatus));
    if (!form.valid) {
      return message(form, "Please fix the highlighted fields and try again.", {
        status: 400,
      });
    }
    if (!user) return fail(401, { form, message: "User is not logged in" });

    const approved = form.data.status === "Approved";
    const payload: TablesUpdate<"vendors"> = {
      status: form.data.status,
      staff_note: form.data.status === "Rejected" ? form.data.staffNote : null,
      is_active: approved,
      verified_by_id: user.id,
      verified_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("vendors")
      .update(payload)
      .eq("id", form.data.ID);

    if (updateError) {
      log.error({ err: updateError.message }, "Failed to update vendor status");
      return setError(form, "Unable to update the vendor status.", {
        status: 500,
      });
    }

    return message(form, "Status updated successfully.");
  },
};
