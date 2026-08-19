import { logError } from "../logError";

export async function approveSubmission(
  submissionID: number,
  supabase: App.Locals["supabase"],
  log: App.Locals["log"],
) {
  const { error } = await supabase.rpc("approve_submission", {
    p_submission_id: submissionID,
  });

  if (error) {
    logError(500, "Failed to approve submission", log, error);
  }
}
