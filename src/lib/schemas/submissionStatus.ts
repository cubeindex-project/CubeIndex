import z from "zod/v4";

const IDSchema = z.int().positive();

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
