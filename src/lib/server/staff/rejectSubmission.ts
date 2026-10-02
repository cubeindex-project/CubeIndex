import { StatusError } from "$lib/errors/StatusError";

export async function rejectSubmission(
  submissionID: number,
  rejectionNote: string,
  supabase: App.Locals["supabase"],
  log: App.Locals["log"],
) {
  log.debug(
    {
      event: "cube.submission.rejection_requested",
      submissionID,
      hasRejectionNote: rejectionNote.length > 0,
    },
    "Cube submission rejection requested",
  );

  const { error } = await supabase.rpc("reject_submission", {
    p_submission_id: submissionID,
    p_reviewer_note: rejectionNote,
  });

  if (error) {
    log.error(
      { event: "cube.submission.rejection_failed", submissionID, err: error },
      "Failed to reject cube submission",
    );
    throw new StatusError(500, "Failed to reject submission", { cause: error });
  }

  log.info(
    {
      event: "cube.submission.rejected",
      submissionID,
      hasRejectionNote: rejectionNote.length > 0,
    },
    "Cube submission rejected",
  );
}
