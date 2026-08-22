import { StatusError } from "$lib/errors/StatusError";

/**
 * Approves a submission through the database RPC.
 *
 * @throws {StatusError} When the approval operation fails.
 */
export async function approveSubmission(
  submissionID: number,
  supabase: App.Locals["supabase"],
) {
  const { error } = await supabase.rpc("approve_submission", {
    p_submission_id: submissionID,
  });

  if (error) {
    throw new StatusError(500, "Failed to approve submission", {
      cause: error,
    });
  }
}
