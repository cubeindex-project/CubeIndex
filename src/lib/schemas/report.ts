import z from "zod/v4";

const additionalInfoSchema = {
  linkToAccount: z.boolean(),
  githubUsername: z.string(),
};

export const bugReportSchema = z.object({
  title: z.string().max(80),
  reproductionSteps: z.string(),
  expected: z.string(),
  actual: z.string(),
  affectedURL: z.string(),
  requestID: z.string(),
  userAgent: z.string(),
  deviceType: z.string(),
  os: z.string(),
  browser: z.string(),
  imageURL: z.string(),
  extra: z.string(),
  ...additionalInfoSchema
});

export const featureRequestSchema = z.object({
  title: z.string(),
  description: z.string(),
  extra: z.string(),
  ...additionalInfoSchema
});

export type BugReportSchema = z.input<typeof bugReportSchema>;
export type FeatureRequestSchema = z.input<typeof featureRequestSchema>;
