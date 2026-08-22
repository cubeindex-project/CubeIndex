import type { Enums } from "$lib/types/database.types";

/**
 * The set of workflow states a submission can have.
 */
type SubmissionStatus = Enums<"submission_status">;

const SUBMISSION_STATUS_BADGE_COLOR_CLASS = {
  Approved: "badge-success",
  Pending: "badge-warning",
  Rejected: "badge-error",
} satisfies Record<SubmissionStatus, string>;

/**
 * Returns the DaisyUI badge color class associated with a submission status.
 */
export function getSubmissionStatusBadgeColor(
  status: SubmissionStatus,
): string {
  return SUBMISSION_STATUS_BADGE_COLOR_CLASS[status];
}
