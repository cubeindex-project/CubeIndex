import z from "zod/v4";

const additionalInfoSchema = {
  linkToAccount: z.boolean(),
  githubUsername: z.string(),
};

export const bugReportSchema = z.object({
  title: z.string().trim().min(1).max(80),
  reproductionSteps: z.string().trim().min(1).max(400),
  expected: z.string().max(200),
  actual: z.string().max(200),
  affectedURL: z.string(),
  requestID: z.string(),
  userAgent: z.string(),
  deviceType: z.string(),
  os: z.string(),
  browser: z.string(),
  imageURL: z.url({ protocol: /^https?$/ }).or(z.literal("")),
  extra: z.string().max(250),
  ...additionalInfoSchema,
});

export const featureRequestSchema = z.object({
  title: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(400),
  extra: z.string().max(250),
  ...additionalInfoSchema,
});

export type BugReportSchema = z.input<typeof bugReportSchema>;
export type FeatureRequestSchema = z.input<typeof featureRequestSchema>;
