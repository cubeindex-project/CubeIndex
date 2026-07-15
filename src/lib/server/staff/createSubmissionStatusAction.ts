import { updateSubmissionStatus } from "$lib/schemas/submissionStatus";
import type { Enums } from "$lib/types/database.types";
import type { PostgrestError } from "@supabase/supabase-js";
import type { Action } from "@sveltejs/kit";
import { fail, message, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

type ReviewedStatus = Exclude<Enums<"submission_status">, "Pending">;

interface SubmissionStatusPayload {
  status: ReviewedStatus;
  staff_note: string | null;
  verified_by_id: string;
  verified_at: string;
}

interface UpdateOptions {
  id: number;
  payload: SubmissionStatusPayload;
  supabase: App.Locals["supabase"];
}

type UpdateSubmission = (
  options: UpdateOptions,
) => Promise<PostgrestError | null>;

export function createSubmissionStatusAction(
  entityLabel: string,
  updateSubmission: UpdateSubmission,
): Action {
  return async ({ request, locals: { supabase, user, log } }) => {
    const form = await superValidate(request, zod4(updateSubmissionStatus));
    if (!form.valid) {
      return message(form, "Please fix the highlighted fields and try again.", {
        status: 400,
      });
    }

    if (!user) {
      return fail(401, { form, message: "User is not logged in" });
    }

    const { ID: id, status } = form.data;
    const updateError = await updateSubmission({
      id,
      supabase,
      payload: {
        status,
        staff_note: status === "Rejected" ? form.data.staffNote : null,
        verified_by_id: user.id,
        verified_at: new Date().toISOString(),
      },
    });

    if (updateError) {
      log.error(
        { err: updateError.message },
        `Failed to update ${entityLabel} status`,
      );
      return setError(form, `Unable to update the ${entityLabel} status.`, {
        status: 500,
      });
    }

    return message(form, "Status updated successfully.");
  };
}
