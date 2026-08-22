import type { Enums } from "$lib/types/database.types";

type SubmissionStatus = Enums<"submission_status">;

const SUBMISSION_STATUS_BADGE_COLOR_CLASS = {
  Approved: "badge-success",
  Pending: "badge-warning",
  Rejected: "badge-error",
} satisfies Record<SubmissionStatus, string>;

export function getSubmissionStatusBadgeColor(
  status: SubmissionStatus,
): string {
  return SUBMISSION_STATUS_BADGE_COLOR_CLASS[status];
}
