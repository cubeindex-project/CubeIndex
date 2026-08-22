import { StatusError } from "$lib/errors/StatusError";

export async function rejectSubmission(
  submissionID: number,
  rejectionNote: string,
  supabase: App.Locals["supabase"],
) {
  const { error } = await supabase.rpc("reject_submission", {
    p_submission_id: submissionID,
    p_reviewer_note: rejectionNote,
  });

  if (error) {
    throw new StatusError(500, "Failed to reject submission", { cause: error });
  }
}
