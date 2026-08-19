import { logError } from "../logError";

export async function rejectSubmission(
  submissionID: number,
  rejectionNote: string,
  supabase: App.Locals["supabase"],
  log: App.Locals["log"],
) {
  const { error } = await supabase.rpc("reject_submission", {
    p_submission_id: submissionID,
    p_reviewer_note: rejectionNote,
  });

  if (error) {
    logError(500, "Failed to reject submission", log, error);
  }
}
