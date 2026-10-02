import { StatusError } from "$lib/errors/StatusError";

/**
 * Approves a submission through the database RPC.
 *
 * @throws {StatusError} When the approval operation fails.
 */
export async function approveSubmission(
  submissionID: number,
  supabase: App.Locals["supabase"],
  log: App.Locals["log"],
) {
  log.debug(
    { event: "cube.submission.approval_requested", submissionID },
    "Cube submission approval requested",
  );

  const { error } = await supabase.rpc("approve_submission", {
    p_submission_id: submissionID,
  });

  if (error) {
    log.error(
      { event: "cube.submission.approval_failed", submissionID, err: error },
      "Failed to approve cube submission",
    );
    throw new StatusError(500, "Failed to approve submission", {
      cause: error,
    });
  }

  log.info(
    { event: "cube.submission.approved", submissionID },
    "Cube submission approved",
  );
}
