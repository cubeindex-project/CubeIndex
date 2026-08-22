import { StatusError } from "$lib/errors/StatusError";

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
