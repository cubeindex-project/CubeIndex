import z from "zod/v4";

/**
 * Validates a positive submission identifier.
 */
const IDSchema = z.int().positive();

/**
 * Validates a staff decision to approve or reject a submission.
 *
 * Rejected submissions require a non-empty staff note; approved submissions do not accept one.
 */
export const updateSubmissionStatus = z.discriminatedUnion("status", [
  z.object({
    submissionID: IDSchema,
    status: z.literal("Approved"),
  }),
  z.object({
    submissionID: IDSchema,
    status: z.literal("Rejected"),
    staffNote: z.string().trim().min(1, "A rejection reason is required"),
  }),
]);
