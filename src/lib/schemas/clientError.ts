import { z } from "zod";

export const clientErrorSchema = z.object({
  error: z.object({
    name: z.string().trim().min(1).max(100),
    message: z.string().trim().min(1).max(2_000),
    stack: z.string().max(10_000).optional(),
  }),
  status: z.number().int().min(400).max(599),
  url: z.url().max(2_048),
});
